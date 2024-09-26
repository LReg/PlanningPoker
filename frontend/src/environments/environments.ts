const env = import.meta.env
const environment: {
    production: boolean;
    productionAddress: string;
    devServer: boolean;
    apiServiceRoute: string;
    socketAddress: string;
    joinAddress: string;
    litProject: string;
    litDomain: string;
} = {
    production: env.VITE_PRODUCTION === 'true',
    devServer: env.VITE_DEV_SERVER === 'true',
    productionAddress: `${env.VITE_PRODUCTION_ADDRESS}`,
    apiServiceRoute: `${env.VITE_PROTOCOL}://${env.VITE_DOMAIN}${env.VITE_TRAEFIK === 'true' ? '' : ':' + env.VITE_BACKEND_PORT}${env.VITE_TRAEFIK === 'true' ? '/api' : ''}`,
    joinAddress: `${env.VITE_PROTOCOL}://${env.VITE_DOMAIN}/join/`,
    socketAddress: `${env.VITE_PROTOCOL}://${env.VITE_DOMAIN}${env.VITE_TRAEFIK === 'true' ? '' : ':' + env.VITE_BACKEND_PORT}`,
    litProject: `${env.VITE_LIT_PROJECT}`,
    litDomain: `${env.VITE_LIT_DOMAIN}`,
}
export default environment;