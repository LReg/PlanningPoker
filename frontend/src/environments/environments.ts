const env = import.meta.env
const environment: {
    production: boolean;
    apiServiceRoute: string;
    socketAdress: string;
    joinAdress: string;
} = {
    production: env.VITE_PRODUCTION === 'true',
    apiServiceRoute: `${env.VITE_PROTOCOL}://${env.VITE_DOMAIN}${env.VITE_TRAEFIK === 'true' ? '' : ':' + env.VITE_BACKEND_PORT}${env.VITE_TRAEFIK === 'true' ? '/api' : ''}`,
    joinAdress: `${env.VITE_PROTOCOL}://${env.VITE_DOMAIN}/join/`,
    socketAdress: `${env.VITE_PROTOCOL}://${env.VITE_DOMAIN}${env.VITE_TRAEFIK === 'true' ? '' : ':' + env.VITE_BACKEND_PORT}`,
}
export default environment;