import { useRuntimeConfig } from '#app'

export interface SearchResult {
    value: string
    fullAddress: string
    coordinates: [number, number]
    id: string
}

interface GeocodingCache {
    [key: string]: {
        timestamp: number;
        data: SearchResult[] | string;
    }
}

export class GeocodingService {
    private apiKey: string
    private cache: GeocodingCache = {}
    private cacheTTL: number = 24 * 60 * 60 * 1000 // 24 часа в миллисекундах
    
    constructor() {
        const config = useRuntimeConfig()
        this.apiKey = config.public.yandexMaps.apikey
    }

    async geocode(query: string, locale: string): Promise<SearchResult[]> {
        // Создаем ключ для кэша
        const cacheKey = `geocode:${query}:${locale}`
        
        // Проверяем наличие данных в кэше
        const cachedData = this.getFromCache<SearchResult[]>(cacheKey)
        if (cachedData) {
            return cachedData
        }
        
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
                
            // Сохраняем результаты в кэш
            this.saveToCache(cacheKey, results)
            
            return results
        } catch (error) {
            console.error('Geocoding error:', error)
            return []
        }
    }

    async getAddressFromCoords(coordinates: number[]): Promise<string> {
        // Создаем ключ для кэша
        const cacheKey = `reverseGeocode:${coordinates.join(',')}`
        
        // Проверяем наличие данных в кэше
        const cachedData = this.getFromCache<string>(cacheKey)
        if (cachedData) {
            return cachedData
        }
        
        try {
            const results = await this.geocode([...coordinates].reverse().join(','), 'ru')
            const address = results[0]?.fullAddress || ''
            
            // Сохраняем результат в кэш
            this.saveToCache(cacheKey, address)
            
            return address
        } catch (error) {
            console.error('Error getting address from coordinates:', error)
            return ''
        }
    }
    
    private getFromCache<T>(key: string): T | null {
        const cachedItem = this.cache[key]
        
        if (!cachedItem) {
            return null
        }
        
        // Проверяем, не истек ли срок действия кэша
        const now = Date.now()
        if (now - cachedItem.timestamp > this.cacheTTL) {
            // Удаляем устаревшие данные
            delete this.cache[key]
            return null
        }
        
        return cachedItem.data as T
    }
    
    private saveToCache(key: string, data: any): void {
        this.cache[key] = {
            timestamp: Date.now(),
            data
        }
    }
    
    // Метод для очистки кэша
    clearCache(): void {
        this.cache = {}
    }
    
    // Метод для установки времени жизни кэша (в миллисекундах)
    setCacheTTL(ttl: number): void {
        this.cacheTTL = ttl
    }
}

export default GeocodingService 