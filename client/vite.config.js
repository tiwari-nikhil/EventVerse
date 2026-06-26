import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
<<<<<<< HEAD
  const apiUrl = env.VITE_API_URL || 'https://eventverse-c9fy.onrender.com/api'
=======
  const apiUrl = env.VITE_API_URL || 'https://eventverse-c9fy.onrender.com'
>>>>>>> 9c9adf8f8256ad9f25ae8cfc01d0e95250426443

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiUrl.replace(/\/api$/, ''),
          changeOrigin: true,
        },
      },
    },
  }
<<<<<<< HEAD
})

=======
})
>>>>>>> 9c9adf8f8256ad9f25ae8cfc01d0e95250426443
