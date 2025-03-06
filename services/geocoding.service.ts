import { useRuntimeConfig } from '#app'

export interface SearchResult {
    value: string
    fullAddress: string
    coordinates: [number, number]
    id: string
}

export class GeocodingService {
    private apiKey: string
    
    constructor() {
        const config = useRuntimeConfig()
        this.apiKey = config.public.yandexMaps.apikey
    }

    async geocode(query: string, locale: string): Promise<SearchResult[]> {
        try {
            const response = await fetch(
                `https://geocode-maps.yandex.ru/1.x/?apikey=${this.apiKey}&format=json&geocode=${encodeURIComponent(query)}&kind=house&lang=${locale === 'ru' ? 'ru_RU' : 'en_US'}`
            )
            const data = await response.json()
            const features = data.response.GeoObjectCollection.featureMember
            
            const results = features
                .filter((feature: any) => {
                    const kind = feature.GeoObject.metaDataProperty.GeocoderMetaData.kind
                    return ['house', 'locality'].includes(kind)
                })
                .map((feature: any) => {
                    const coordinates = feature.GeoObject.Point.pos.split(' ').map(Number) as [number, number]
                    return {
                        value: feature.GeoObject.name,
                        fullAddress: feature.GeoObject.metaDataProperty.GeocoderMetaData.Address.formatted,
                        coordinates,
                        id: feature.GeoObject.metaDataProperty.GeocoderMetaData.Address.formatted
                    }
                })
            
            return results
        } catch (error) {
            console.error('Geocoding error:', error)
            return []
        }
    }

    async getAddressFromCoords(coordinates: number[]): Promise<string> {
        try {
            const results = await this.geocode([...coordinates].join(','), 'ru')
            const address = results[0]?.fullAddress || ''
            
            return address
        } catch (error) {
            console.error('Error getting address from coordinates:', error)
            return ''
        }
    }
}

export default GeocodingService 