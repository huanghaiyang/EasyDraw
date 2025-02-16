import { IBorderTransformer } from "@/types/ITransformer";
import SegmentController from "@/modules/handler/controller/SegmentController";

export default class BorderTransformer
  extends SegmentController
  implements IBorderTransformer {}
