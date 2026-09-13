/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: ['sanitize-html', 'htmlparser2'],
	},
}
export default nextConfig
