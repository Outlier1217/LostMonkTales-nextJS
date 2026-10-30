const publicFileServerUrl = process.env.FILE_SERVER_PUBLIC_URL

const remotePatterns = []
if (publicFileServerUrl) {
	try {
		const url = new URL(publicFileServerUrl)
		remotePatterns.push({
			protocol: url.protocol.replace(':', ''),
			hostname: url.hostname,
			...(url.port ? { port: url.port } : {}),
			pathname: '/**',
		})
	} catch {
		throw new Error('FILE_SERVER_PUBLIC_URL must be a valid absolute URL')
	}
}

/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: ['sanitize-html', 'htmlparser2'],
	},
	images: { remotePatterns },
}
export default nextConfig
