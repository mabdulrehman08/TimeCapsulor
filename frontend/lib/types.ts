export type CapsuleSession = {
  id: string;
  createdAt: string;
  title: string;
  videoUrl?: string;
  durationSec?: number;
  transcript?: string;
  vapiSessionId?: string;
};
