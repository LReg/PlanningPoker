import type {EstimationHistogram} from "@/models/EstimationHistogram";
import {ref} from "vue";
import type {Ref} from "vue";

const reactiveEstimationHistogram: Ref<EstimationHistogram | null> = ref(null);
export default reactiveEstimationHistogram;