import { registerWebModule, NativeModule } from 'expo';

class TilAndroidModule extends NativeModule<{}> {}

export default registerWebModule(TilAndroidModule, 'TilAndroidModule');
