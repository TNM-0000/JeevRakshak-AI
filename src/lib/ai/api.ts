/**
 * JeevRakshak AI - Authoritative FastAPI AI Service Client
 * 
 * Communicates with the Phase 2 / Phase 3A Python FastAPI backend (/api/ai/assess).
 * Handles both JSON payload (text narrative) and multipart/form-data (when photographic image is provided).
 * Provides strict error handling and never fabricates mock diagnoses.
 */

import { JeevRakshakAssessment } from './contracts';

export interface AssessmentCaseInput {
  text: string;
  state?: string | null;
  district?: string | null;
  species?: string | null;
  affected_count?: number | null;
  total_herd_size?: number | null;
  duration_days?: number | null;
  vaccination_status?: string | null;
  mortality_count?: number | null;
}

export interface ApiHealthStatus {
  status: string;
  service: string;
  version: string;
}

export class AiServiceError extends Error {
  statusCode?: number;
  isConnectionError: boolean;

  constructor(message: string, statusCode?: number, isConnectionError = false) {
    super(message);
    this.name = 'AiServiceError';
    this.statusCode = statusCode;
    this.isConnectionError = isConnectionError;
  }
}

/**
 * Returns the configured base URL for the FastAPI service.
 */
export function getAiApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_AI_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  // In the browser, use relative path to route through Next.js same-origin rewrite proxy
  if (typeof window !== 'undefined') {
    return '';
  }
  return 'http://127.0.0.1:8000';
}

/**
 * Health check verification against FastAPI GET /health
 */
export async function checkAiHealth(): Promise<ApiHealthStatus> {
  const baseUrl = getAiApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      throw new AiServiceError(
        `AI service health check returned status ${res.status}: ${res.statusText}`,
        res.status
      );
    }

    return await res.json();
  } catch (err: any) {
    if (err instanceof AiServiceError) throw err;
    throw new AiServiceError(
      `Cannot connect to JeevRakshak AI service at ${baseUrl}. Ensure FastAPI is running.`,
      undefined,
      true
    );
  }
}

/**
 * Submits clinical case data and optional photo to FastAPI POST /api/ai/assess.
 * Returns the canonical JeevRakshakAssessment contract.
 */
export async function assessLivestockCase(
  input: AssessmentCaseInput,
  imageFile?: File | Blob | null
): Promise<JeevRakshakAssessment> {
  const baseUrl = getAiApiBaseUrl();
  const endpoint = `${baseUrl}/api/ai/assess`;

  try {
    let response: Response;

    if (imageFile && imageFile.size > 0) {
      // Multipart/form-data submission
      const formData = new FormData();
      if (input.text && input.text.trim()) {
        formData.append('text', input.text.trim());
      }
      if (input.state) formData.append('state', input.state);
      if (input.district) formData.append('district', input.district);
      if (input.species) formData.append('species', input.species.toLowerCase());
      if (input.affected_count !== undefined && input.affected_count !== null) {
        formData.append('affected_count', String(input.affected_count));
      }
      if (input.total_herd_size !== undefined && input.total_herd_size !== null) {
        formData.append('total_herd_size', String(input.total_herd_size));
      }
      if (input.duration_days !== undefined && input.duration_days !== null) {
        formData.append('duration_days', String(input.duration_days));
      }
      if (input.vaccination_status) {
        formData.append('vaccination_status', input.vaccination_status);
      }

      const filename = (imageFile as File).name || 'clinical_evidence.jpg';
      formData.append('image', imageFile, filename);

      response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
    } else {
      // Application/JSON submission
      const payload: Record<string, any> = {
        text: input.text || 'Clinical observation of livestock health issue.',
      };

      if (input.state) payload.state = input.state;
      if (input.district) payload.district = input.district;
      if (input.species) payload.species = input.species.toLowerCase();
      if (input.affected_count !== undefined && input.affected_count !== null) {
        payload.affected_count = input.affected_count;
      }
      if (input.total_herd_size !== undefined && input.total_herd_size !== null) {
        payload.total_herd_size = input.total_herd_size;
      }
      if (input.duration_days !== undefined && input.duration_days !== null) {
        payload.duration_days = input.duration_days;
      }
      if (input.vaccination_status) {
        payload.vaccination_status = input.vaccination_status;
      }

      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
    }

    if (!response.ok) {
      let errorDetail = `AI assessment failed with HTTP ${response.status}: ${response.statusText}`;
      try {
        const errJson = await response.json();
        if (errJson.detail) {
          errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
        }
      } catch {
        // Fall back to status text if body is not json
      }
      throw new AiServiceError(errorDetail, response.status);
    }

    const assessment: JeevRakshakAssessment = await response.json();
    return assessment;
  } catch (err: any) {
    if (err instanceof AiServiceError) {
      throw err;
    }
    throw new AiServiceError(
      `Failed to reach JeevRakshak AI service at ${baseUrl}: ${err?.message || 'Network error'}. Please verify FastAPI is running.`,
      undefined,
      true
    );
  }
}
