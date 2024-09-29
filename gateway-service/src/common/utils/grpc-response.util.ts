export function transformGrpcResponse(response: any): any {
    const transformField = (field: any) => {
      if (field && typeof field === 'object') {
        if ('low' in field && 'high' in field) {
          return field.low;
        }
        if ('seconds' in field && 'nanos' in field) {
          return new Date(field.seconds.low * 1000 + field.nanos / 1000000);
        }
      }
      return field;
    };
  
    const transformedResponse: any = {};
    for (const key in response) {
      if (response.hasOwnProperty(key)) {
        transformedResponse[key] = transformField(response[key]);
      }
    }
    return transformedResponse;
  }