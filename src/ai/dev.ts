import { config } from 'dotenv';
config();

import '@/ai/flows/generate-medical-recommendations.ts';
import '@/ai/flows/analyze-lung-scan-image.ts';