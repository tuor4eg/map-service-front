import ApiService from "~/services/api.service"

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $apiService: ApiService
  }
}
