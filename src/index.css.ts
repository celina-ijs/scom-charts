import { Styles } from "@ijstech/components";

export const containerStyle = Styles.style({
  width: 'var(--layout-container-width)',
  maxWidth: 'var(--layout-container-max_width)',
  textAlign: ('var(--layout-container-text_align)' as any),
  margin: '0 auto',
  padding: 10,
  background: 'var(--custom-background-color, var(--background-main))'
})

export const textStyle = Styles.style({
  color: 'var(--custom-text-color, var(--text-primary))'
})

export const chartStyle = Styles.style({
  display: 'block',
})
