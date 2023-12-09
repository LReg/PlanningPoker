import type { Ref } from "vue";
import {ref} from "vue";
import type {ExportEstimateSession, Session} from "@/models/Session.model";
const reactiveSession: Ref<ExportEstimateSession | null> = ref(null);
export default reactiveSession;