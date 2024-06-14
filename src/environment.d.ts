declare global {
    namespace NodeJS {
        interface ProcessEnv {
          PORT: string;
          DATACLOUD_SIGNING_KEY?: string;
        }
    }
}