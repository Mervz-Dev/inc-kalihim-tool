import { requireNativeModule } from "expo";

import { HandwritingOcrModuleType } from "./HandwritingOcr.types";

export default requireNativeModule<HandwritingOcrModuleType>("HandwritingOcr");
