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
  user_query: string,
  analysis_mode: string = 'premium'
): Promise<AnalyzeResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file_id, user_query, analysis_mode }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Analysis failed');
  }

  return response.json();
};
