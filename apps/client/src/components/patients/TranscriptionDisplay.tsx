import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Mic,
  FileAudio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface TranscriptionDisplayProps {
  status: 'uploading' | 'pending' | 'completed' | 'failed';
  transcription?: string;
  audioUrl?: string;
  error?: string;
  onRetry: () => void;
  onRerecord: () => void;
}

export function TranscriptionDisplay({
  status,
  transcription,
  audioUrl,
  error,
  onRetry,
  onRerecord,
}: TranscriptionDisplayProps) {
  if (status === 'uploading' || status === 'pending') {
    return (
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-4" />
          <p className="text-sm font-medium text-slate-700">
            {status === 'uploading'
              ? 'Uploading audio...'
              : 'Transcribing audio...'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            This may take a few moments
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status === 'failed') {
    return (
      <Card className="border-rose-200 bg-rose-50">
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          <AlertCircle className="h-8 w-8 text-rose-500 mb-3" />
          <p className="text-sm font-medium text-rose-700 mb-1">
            Transcription Failed
          </p>
          {error && (
            <p className="text-xs text-rose-600 mb-4 max-w-[90%] break-words">
              {error}
            </p>
          )}
          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="border-rose-200 hover:bg-rose-100 hover:text-rose-700 text-rose-700"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Retry
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRerecord}
              className="text-rose-700 hover:bg-rose-100 hover:text-rose-800"
            >
              <Mic className="mr-2 h-3 w-3" />
              Re-record
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'completed') {
    return (
      <Card className="border-teal-100 bg-white shadow-sm overflow-hidden">
        <div className="bg-teal-50/50 border-b border-teal-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-teal-600" />
            <span className="text-sm font-medium text-teal-900">
              Transcription Complete
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRerecord}
            className="h-7 text-xs text-slate-500 hover:text-slate-900"
          >
            <Mic className="mr-1.5 h-3 w-3" />
            New Recording
          </Button>
        </div>

        <CardContent className="p-4 space-y-4">
          {audioUrl && (
            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-md border border-slate-100">
              <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                <FileAudio className="h-4 w-4 text-slate-500" />
              </div>
              <audio
                controls
                src={audioUrl}
                className="w-full h-8 opacity-90"
                controlsList="nodownload"
              />
            </div>
          )}

          <div className="prose prose-sm prose-slate max-w-none bg-white">
            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
              {transcription || 'No transcription text available.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
