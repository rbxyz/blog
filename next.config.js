/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Configuração para servir imagens estáticas
    images: {
        domains: ['localhost', '127.0.0.1'],
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/upload/**',
            },
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },

    // Configuração para servir arquivos estáticos
    async rewrites() {
        return [
            {
                source: '/upload/:path*',
                destination: '/upload/:path*',
            },
        ];
    },

    // Headers de segurança
    async headers() {
        return [
            {
                source: '/upload/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
