export interface NotifyAppConfig {
  httpPort: number;
  grpcUrl: string;
  environment: string;
  serviceName: string;
  iamGrpcClientUrl: string;
}
