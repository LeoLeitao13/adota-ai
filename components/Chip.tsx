import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme';

type Props = {
  ativo: boolean;
  texto: string;
  onPress: () => void;
};

/**
 * Botão de seleção único (chip) usado em formulários de seleção
 * de opções, como estilo de vida, porte, espécie, etc.
 */
export function Chip({ ativo, texto, onPress }: Props) {
  return (
    <TouchableOpacity
      style={ativo ? styles.chipAtivo : styles.chip}
      onPress={onPress}
    >
      <Text style={ativo ? styles.textoAtivo : styles.texto}>{texto}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  chipAtivo: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  texto: {
    color: theme.colors.text,
  },
  textoAtivo: {
    color: theme.colors.white,
    fontWeight: theme.weight.semibold,
  },
});
