const API_BASE_URL = 'http://localhost:8000';

export interface UploadResponse {
  file_id: string;
  file_type: string;
  file_size: number;
  original_filename: string;
}

export interface AnalyzeResponse {
  analysis: string;
  processing_time: number;
}

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Upload failed');
  }

  return response.json();
};

export const analyzeFile = async (
  file_id: string,
  user_query: string
): Promise<AnalyzeResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file_id, user_query }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Analysis failed');
  }

  return response.json();
};

export interface ProgressEvent {
  type: 'start' | 'processing' | 'progress' | 'complete' | 'error';
  message?: string;
  stage?: number;
  total?: number;
  name?: string;
  status?: string;
  progress_pct?: number;
  analysis?: string;
  processing_time?: number;
}

export const analyzeFileWithProgress = (
  file_id: string,
  user_query: string,
  onProgress: (event: ProgressEvent) => void,
  onComplete: (analysis: string, processing_time: number) => void,
  onError: (error: string) => void
): (() => void) => {
  const eventSource = new EventSource(
    `${API_BASE_URL}/api/analyze-stream?file_id=${encodeURIComponent(file_id)}&user_query=${encodeURIComponent(user_query)}`,
    { withCredentials: false }
  );

  // Use fetch to POST the request body, then connect EventSource
  fetch(`${API_BASE_URL}/api/analyze-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file_id, user_query }),
  }).then(response => {
    if (!response.ok) {
      throw new Error('Failed to start analysis');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    function readStream() {
      reader?.read().then(({ done, value }) => {
        if (done) {
          return;
        }

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'complete') {
                onComplete(data.analysis, data.processing_time);
              } else if (data.type === 'error') {
                onError(data.message);
              } else {
                onProgress(data);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }

        readStream();
      }).catch(err => {
        onError(err.message);
      });
    }

    readStream();
  }).catch(err => {
    onError(err.message);
  });

  // Return cleanup function
  return () => {
    // Cleanup handled by fetch stream
  };
};
