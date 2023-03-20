
export const extensions: Array<IExtensionConfig>  = [
    {
        "id": "obsrv-config-service-ext",
        "routePath": "/routes/Routes"
       }
]


interface IExtensionConfig {
    id: string;
    routePath: string;
}