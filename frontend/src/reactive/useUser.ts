import {ref} from "vue";
import type { Ref } from "vue";
import type {Player} from "@/models/Player.model";

const reactiveUser: Ref<Player | null> = ref(null);
export default reactiveUser;