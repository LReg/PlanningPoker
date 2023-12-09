const env = process.env.NODE_ENV;
const environment: {
    production: boolean;
    apiServiceRoute: string;
    socketAdress: string;
    joinAdress: string;
} = {
    production: env === 'production',
    apiServiceRoute: env === 'production' ? 'https://YOURDOMAIN/api' : 'http://localhost:80',
    joinAdress: env === 'production' ? 'https://YOURDOMAIN/join/' : 'http://localhost:5173/join/',
    socketAdress: env === 'production' ? 'https://YOURDOMAIN' : 'http://localhost:80',
}
export default environment;