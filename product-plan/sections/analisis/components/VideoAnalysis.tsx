import React from 'react'
import type { VideoPostura, AnalisisBiomecanico } from '../../../../product/sections/analisis/types'

interface VideoAnalysisProps {
  pacienteNombre: string
  videos: VideoPostura[]
  videoSesionInicial?: VideoPostura
  onExportar?: () => void
  onVolver?: () => void
}

export function VideoAnalysis({
  pacienteNombre,
  videos,
  videoSesionInicial,
  onExportar,
  onVolver,
}: VideoAnalysisProps) {
  const [selectedVideo, setSelectedVideo] = React.useState<VideoPostura>(videos[0])
  const [playbackSpeed, setPlaybackSpeed] = React.useState<number>(1)
  const [currentTime, setCurrentTime] = React.useState<number>(0)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [showGhostOverlay, setShowGhostOverlay] = React.useState(false)

  const toggleGhostOverlay = () => setShowGhostOverlay(!showGhostOverlay)

  const getFaseContactoColor = (fase: string) => {
    const colors: Record<string, string> = {
      talon: 'bg-amber-100 text-amber-700 dark:bg-amber-200 dark:text-amber-800',
      antepie: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-200 dark:text-emerald-800',
      medio: 'bg-sky-100 text-sky-700 dark:bg-sky-200 dark:text-sky-800',
      'no-aplicable': 'bg-slate-100 text-slate-700 dark:bg-slate-200 dark:text-slate-800',
    }
    return colors[fase] || 'bg-slate-100 text-slate-700'
  }

  const getActitudAntalgicaColor = (actitud: string) => {
    const colors: Record<string, string> = {
      ninguna: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-200 dark:text-emerald-800',
      'compensatoria-lumbar': 'bg-orange-100 text-orange-700 dark:bg-orange-200 dark:text-orange-800',
      'compensatoria-pelvis': 'bg-amber-100 text-amber-700 dark:bg-amber-200 dark:text-amber-800',
      'compensatoria-tronco': 'bg-rose-100 text-rose-700 dark:bg-rose-200 dark:text-rose-800',
    }
    return colors[actitud] || 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <button
              onClick={onVolver}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              ← Volver al Dashboard
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Análisis de Video
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {pacienteNombre}
                </p>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700 dark:bg-teal-200 dark:text-teal-800">
                  {selectedVideo.tipo.charAt(0).toUpperCase() + selectedVideo.tipo.slice(1)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {videoSesionInicial && (
              <button
                onClick={toggleGhostOverlay}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${
                  showGhostOverlay
                    ? 'bg-teal-500 border-teal-500 text-white hover:bg-teal-600'
                    : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {showGhostOverlay ? 'Ocultar Sesión Inicial' : 'Mostrar Sesión Inicial'}
              </button>
            )}
            <button
              onClick={onExportar}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Exportar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <VideoPlayer
              video={selectedVideo}
              ghostVideo={showGhostOverlay ? videoSesionInicial : undefined}
              playbackSpeed={playbackSpeed}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onSeek={setCurrentTime}
              onSpeedChange={setPlaybackSpeed}
            />

            <BiomechanicalPanel
              analisis={selectedVideo.analisisBiomecanico}
              observaciones={selectedVideo.observaciones}
              getFaseContactoColor={getFaseContactoColor}
              getActitudAntalgicaColor={getActitudAntalgicaColor}
            />
          </div>

          <div className="space-y-6">
            <VideoList
              videos={videos}
              selectedVideo={selectedVideo}
              onSelectVideo={setSelectedVideo}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface VideoPlayerProps {
  video: VideoPostura
  ghostVideo?: VideoPostura
  playbackSpeed: number
  currentTime: number
  isPlaying: boolean
  onPlayPause: () => void
  onSeek: (time: number) => void
  onSpeedChange: (speed: number) => void
}

function VideoPlayer({
  video,
  ghostVideo,
  playbackSpeed,
  currentTime,
  isPlaying,
  onPlayPause,
  onSeek,
  onSpeedChange,
}: VideoPlayerProps) {
  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = (currentTime / video.duracion) * 100

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="aspect-video bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-24 h-24 mx-auto rounded-full bg-slate-800 flex items-center justify-center">
              <span className="text-4xl opacity-50">▶️</span>
            </div>
            <p className="text-sm text-slate-400">Video de {video.tipo}</p>
            <p className="text-xs text-slate-500">{video.duracion}s @ {video.fps} fps</p>
          </div>
        </div>

        {ghostVideo && (
          <div className="absolute inset-0 bg-slate-800/50 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-20 h-20 mx-auto rounded-full bg-sky-500/20 border-4 border-sky-500/50 flex items-center justify-center">
                <span className="text-3xl opacity-50">👻</span>
              </div>
              <p className="text-sm text-sky-300 font-medium">Sesión Inicial (Ghost)</p>
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <button
            onClick={onPlayPause}
            className="w-16 h-16 mx-auto rounded-full bg-teal-500 hover:bg-teal-600 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
          >
            <span className="text-2xl text-white">
              {isPlaying ? '⏸' : '▶️'}
            </span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {formatTime(currentTime)} / {formatTime(video.duracion)}
            </span>
            <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
              {playbackSpeed}x
            </span>
          </div>
          <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden cursor-pointer">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
            <input
              type="range"
              min="0"
              max={video.duracion}
              step={0.1}
              value={currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Velocidad:</span>
          {speedOptions.map((speed) => (
            <button
              key={speed}
              onClick={() => onSpeedChange(speed)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                playbackSpeed === speed
                  ? 'bg-teal-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

interface BiomechanicalPanelProps {
  analisis: AnalisisBiomecanico
  observaciones: string
  getFaseContactoColor: (fase: string) => string
  getActitudAntalgicaColor: (actitud: string) => string
}

function BiomechanicalPanel({
  analisis,
  observaciones,
  getFaseContactoColor,
  getActitudAntalgicaColor,
}: BiomechanicalPanelProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-3">
        <span>📊</span>
        Análisis Biomecánico
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Fase de Contacto</p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getFaseContactoColor(analisis.faseContacto)}`}>
            {analisis.faseContacto.charAt(0).toUpperCase() + analisis.faseContacto.slice(1)}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Despegue del Pie</p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            analisis.despeguePie === 'normal'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-200 dark:text-emerald-800'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-200 dark:text-amber-800'
          }`}>
            {analisis.despeguePie.charAt(0).toUpperCase() + analisis.despeguePie.slice(1)}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Aterrizaje</p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            analisis.aterrizaje === 'plano'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-200 dark:text-emerald-800'
              : 'bg-rose-100 text-rose-700 dark:bg-rose-200 dark:text-rose-800'
          }`}>
            {analisis.aterrizaje.charAt(0).toUpperCase() + analisis.aterrizaje.slice(1)}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Ayuda Mecánica</p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            analisis.ayudaMecanica
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-200 dark:text-amber-800'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-200 dark:text-emerald-800'
          }`}>
            {analisis.ayudaMecanica ? 'Sí' : 'No'}
          </span>
        </div>
      </div>

      <div className={`p-4 rounded-xl border-2 ${getActitudAntalgicaColor(analisis.actitudAntalgica)}`}>
        <p className="text-sm opacity-75 mb-1">Actitud Antálgica</p>
        <p className="text-lg font-bold capitalize">
          {analisis.actitudAntalgica.replace(/-/g, ' ')}
        </p>
      </div>

      {(analisis.genuFlexo !== undefined || analisis.inclinacionTronco !== undefined) && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ángulos Articulares</h3>
          <div className="grid grid-cols-2 gap-4">
            {analisis.genuFlexo !== undefined && (
              <div className="bg-sky-50 dark:bg-slate-700 rounded-xl p-4 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Genu Flexo</p>
                <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                  {analisis.genuFlexo}°
                </p>
              </div>
            )}
            {analisis.inclinacionTronco !== undefined && (
              <div className="bg-teal-50 dark:bg-slate-700 rounded-xl p-4 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Inclinación Tronco</p>
                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {analisis.inclinacionTronco}°
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {observaciones && (
        <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Observaciones</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {observaciones}
          </p>
        </div>
      )}
    </div>
  )
}

interface VideoListProps {
  videos: VideoPostura[]
  selectedVideo: VideoPostura
  onSelectVideo: (video: VideoPostura) => void
}

function VideoList({ videos, selectedVideo, onSelectVideo }: VideoListProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Videos
        </h2>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-[600px] overflow-y-auto">
        {videos.map((video) => (
          <button
            key={video.id}
            onClick={() => onSelectVideo(video)}
            className={`w-full p-4 text-left transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-700 ${
              selectedVideo.id === video.id
                ? 'bg-teal-50 dark:bg-teal-900/30 border-l-4 border-teal-500'
                : ''
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-800 dark:text-slate-100 capitalize">
                  {video.tipo}
                </p>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {video.fecha}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>{video.duracion}s</span>
                <span>{video.fps} fps</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
