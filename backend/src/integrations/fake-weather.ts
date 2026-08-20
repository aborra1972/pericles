export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
}

export class FakeWeatherAdapter {
  private shouldError = false;

  setShouldError(value: boolean): void {
    this.shouldError = value;
  }

  async getWeather(location: string): Promise<WeatherData> {
    if (this.shouldError) {
      throw new Error('Weather API error');
    }

    return {
      location,
      temperature: 25,
      condition: 'Sunny',
      humidity: 60,
    };
  }
}
