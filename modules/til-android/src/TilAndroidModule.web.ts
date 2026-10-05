import { registerWebModule, NativeModule } from 'expo';

class TilAndroidModule extends NativeModule<Record<string, (...args: any[]) => void>> {}

export default registerWebModule(TilAndroidModule, 'TilAndroidModule');
