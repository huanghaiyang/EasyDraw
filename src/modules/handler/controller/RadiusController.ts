import { IVerticesTransformer } from "@/types/ITransformer";
import VerticesTransformer from "@/modules/handler/transformer/VerticesTransformer";

export default class RadiusController
  extends VerticesTransformer
  implements IVerticesTransformer {}
