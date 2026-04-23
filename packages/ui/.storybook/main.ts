import type { StorybookConfig } from '@storybook/react-vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.{ts,tsx}'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-vite',
    options: {
      viteFinal: async (config) => {
        return {
          ...config,
          plugins: [
            react(),
            tailwindcss(),
          ],
        }
      },
    },
  },
}

export default config
