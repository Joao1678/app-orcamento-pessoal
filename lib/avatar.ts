/**
 * Avatares de perfil: apenas presets da aplicação.
 *
 * O campo `profiles.avatar_url` guarda a referência do avatar no formato
 * "preset:{id}" (ex.: "preset:astronaut"), ou null quando o usuário não
 * escolheu nenhum. Não há upload de imagem, então nada aqui depende do
 * Storage.
 */

export const PRESET_PREFIX = 'preset:'

export interface AvatarPreset {
  id: string
  emoji: string
  label: string
  /** Cor usada no fundo do avatar pré-definido. */
  color: string
}

/**
 * Avatar pronto para renderização, já resolvido para exibição.
 * Compartilhado entre o layout (servidor) e a página de
 * configurações (cliente).
 */
export interface AvatarView {
  /** Emoji do preset, ou null quando não há avatar escolhido. */
  emoji: string | null
  color: string | null
}

export const EMPTY_AVATAR: AvatarView = { emoji: null, color: null }

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'astronaut',  emoji: '👨‍🚀', label: 'Astronauta', color: '#7C3AED' },
  { id: 'wizard',     emoji: '🧙', label: 'Mago',       color: '#3B82F6' },
  { id: 'ninja',      emoji: '🥷', label: 'Ninja',      color: '#111120' },
  { id: 'cat',        emoji: '🐱', label: 'Gato',       color: '#F59E0B' },
  { id: 'dog',        emoji: '🐶', label: 'Cachorro',   color: '#10B981' },
  { id: 'fox',        emoji: '🦊', label: 'Raposa',     color: '#EF4444' },
  { id: 'panda',      emoji: '🐼', label: 'Panda',      color: '#6B7280' },
  { id: 'unicorn',    emoji: '🦄', label: 'Unicórnio',  color: '#EC4899' },
  { id: 'alien',      emoji: '👽', label: 'Alien',      color: '#06B6D4' },
  { id: 'ghost',      emoji: '👻', label: 'Fantasma',   color: '#8B5CF6' },
  { id: 'robot',      emoji: '🤖', label: 'Robô',       color: '#3B82F6' },
  { id: 'crown',      emoji: '👑', label: 'Coroa',      color: '#F59E0B' },
]

export function buildPresetRef(id: string): string {
  return `${PRESET_PREFIX}${id}`
}

/**
 * Resolve a referência gravada em `profiles.avatar_url` para exibição.
 * Retorna null para valores desconhecidos, em vez de quebrar a tela —
 * assim um preset removido do código no futuro não invalida a página.
 */
export function resolveAvatarView(ref: string | null | undefined): AvatarView {
  if (!ref?.startsWith(PRESET_PREFIX)) return EMPTY_AVATAR

  const preset = AVATAR_PRESETS.find((p) => p.id === ref.slice(PRESET_PREFIX.length))
  if (!preset) return EMPTY_AVATAR

  return { emoji: preset.emoji, color: preset.color }
}
