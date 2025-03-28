<script setup lang="ts">
import ViewModal from "./ViewModal.vue"

import { copyToClipboard } from "../utils"
import { throttle } from "lodash"
import { ref } from "vue"
import { useBoolean } from "../hooks/useBoolean"

const { visite } = defineProps({
  visite: Boolean,
})

const emits = defineEmits(["clickByMask"])

const [visPoppver, { toggle: togglePoppver }] = useBoolean(false)

const handleClickShareItem = throttle(
  () => {
    copyToClipboard(window.location.href)
  },
  500,
  { trailing: false },
)

const handleClickByMask = throttle(
  () => {
    emits("clickByMask")
  },
  500,
  { trailing: false },
)
</script>

<template>
  <ViewModal :visible="visite" @click-by-mask="handleClickByMask">
    <div class="share-img"></div>
    <a
      href="https://github.com/cleves0315/ZZZEvent-ADreamComeTrueAtLast"
      target="_blank"
      class="github-share"
    >
      <img
        style="border-radius: 50%; background-color: #000"
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABACAYAAACunKHjAAAAAXNSR0IArs4c6QAABApJREFUeF7tm112GyEMhc1iuo42j11VmpU1WRmNKJojGH50JSbGPslLzrEZQB9XEmhwuH3BX4zxVx6G//8Uw/Jn7/mzD/HdewiBP790puGq3rPxZCQZzcZah3ujB0MIf6wdzJ5bCiIb/1qt/mwO6PekkI/VUJaBiDH+XbDyKJS3VUDcIGKMJFdWAWrIqvZuIGYQmwCQICmOmIOrCcSGEAogFneBQdwpFqAuBLuKGoTICN5UiBplbQ/BUIHIECgrPNofxYwXzaSnIB4YAtuvgqEBETVEN28zdZMhiAcJjNo1GMLoglCmyLTdzTO5x6ZKHtQ047/0DnFNEEoIZH9BWRy0NJPSrmTdjoyncYtTqVa94XOT0Rq4B0IVF3qd0kAATARIV95AUG/2cQIBGDCNxqIvXj0+Tg9rDEJZBCnVLmZpEABB3Z1cpAVCpYa8r1flaGTJPW3jJ3nl86dFLEAAaqDxpopQTmpZMwDESRU1CC3RZwBRLOQBAlTDdiDAGMEqPGKFBIGoIXU0yhrL9K7syLCQhXskEEaau4GgUzF6MDzcg0FYym3T/btyMZc1026qqgGTezAItPC6HQQ2Dswch3swCCg+7BQbajkZYkVyj2B4cFs1WFVBC/usICBXN4HY2S2EItDg/4MUAdNbFuYv6sjg7k8LAt1TJBBPkzGEa6Agfj8rCDRGfIPIKkogoGDZqu5cFPPM3RqC5TcIjyK2q0w1ttlQArjdbnj63LFEJ0EYSwoJBBphT/U+szNf8KDFHt5iozl3uzJdpQjULf6fPnOFCn14S1VY1MBv66yFme1UYYwNZEcqK3hKdUcnF7g63CV6VOAB+DTtKt7mzu5aqHFeaTrmLsv56A5TrlrzDTW8rOADxpggR2mCGGUPvgcxe93vuuuo5eBUwTGMLDLVr/xaqih2ksqzyXGBxHLnsbFT5Jt8tBCrbvUVLq19Cdy6EIJOqntbpaWEVaveU1ldckSvBSRjxO8v1G+WLLVOR0qcedkpwLdADHeabBB4TcicWZSuODO8+L61KL2rQ6MMkmIGRWzyf03ktqiBZ36BKnRXh/KWe3b+kC4iA1lrZcxqUM4FUUN3LtbrhUcmoRUTcUNGdMoc9J3750fWXWNNaKTM2YXT0RG9yALCVRKMDIeeN/+GQriH5VBYcxhmLc0VZDUMRKNI2wWKmLrnFET201HwnA6CGN3ZU3gUoZqfCoQCRjqJCiNSfMh3JE+3ZFEwDkWoICRXRialSZWN/tST6c3FCALayUIgsjLQGudXgzCdhGEQBhju8j+gCPNYJhAirWnUYZ4ckD5NKpCu6AIhdn6jk+jVINyuBwfLUWDNgZSa1MUb90Q7rrG0CORWRCfvs8u4JVvFpCX9teb8DyyBfV0JyJD5AAAAAElFTkSuQmCC"
        alt="github"
        class="share-popover-icon"
      />
    </a>
    <div class="share-btn" @click="togglePoppver">
      <div class="share-popover" v-if="visPoppver">
        <div class="share-popover-list">
          <!-- <div class="share-popover-item">
            <a href="https://github.com/cleves0315/ZZZEvent-ADreamComeTrueAtLast" target="_blank">
              <img
                style="border-radius: 50%; background-color: #000"
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABACAYAAACunKHjAAAAAXNSR0IArs4c6QAABApJREFUeF7tm112GyEMhc1iuo42j11VmpU1WRmNKJojGH50JSbGPslLzrEZQB9XEmhwuH3BX4zxVx6G//8Uw/Jn7/mzD/HdewiBP790puGq3rPxZCQZzcZah3ujB0MIf6wdzJ5bCiIb/1qt/mwO6PekkI/VUJaBiDH+XbDyKJS3VUDcIGKMJFdWAWrIqvZuIGYQmwCQICmOmIOrCcSGEAogFneBQdwpFqAuBLuKGoTICN5UiBplbQ/BUIHIECgrPNofxYwXzaSnIB4YAtuvgqEBETVEN28zdZMhiAcJjNo1GMLoglCmyLTdzTO5x6ZKHtQ047/0DnFNEEoIZH9BWRy0NJPSrmTdjoyncYtTqVa94XOT0Rq4B0IVF3qd0kAATARIV95AUG/2cQIBGDCNxqIvXj0+Tg9rDEJZBCnVLmZpEABB3Z1cpAVCpYa8r1flaGTJPW3jJ3nl86dFLEAAaqDxpopQTmpZMwDESRU1CC3RZwBRLOQBAlTDdiDAGMEqPGKFBIGoIXU0yhrL9K7syLCQhXskEEaau4GgUzF6MDzcg0FYym3T/btyMZc1026qqgGTezAItPC6HQQ2Dswch3swCCg+7BQbajkZYkVyj2B4cFs1WFVBC/usICBXN4HY2S2EItDg/4MUAdNbFuYv6sjg7k8LAt1TJBBPkzGEa6Agfj8rCDRGfIPIKkogoGDZqu5cFPPM3RqC5TcIjyK2q0w1ttlQArjdbnj63LFEJ0EYSwoJBBphT/U+szNf8KDFHt5iozl3uzJdpQjULf6fPnOFCn14S1VY1MBv66yFme1UYYwNZEcqK3hKdUcnF7g63CV6VOAB+DTtKt7mzu5aqHFeaTrmLsv56A5TrlrzDTW8rOADxpggR2mCGGUPvgcxe93vuuuo5eBUwTGMLDLVr/xaqih2ksqzyXGBxHLnsbFT5Jt8tBCrbvUVLq19Cdy6EIJOqntbpaWEVaveU1ldckSvBSRjxO8v1G+WLLVOR0qcedkpwLdADHeabBB4TcicWZSuODO8+L61KL2rQ6MMkmIGRWzyf03ktqiBZ36BKnRXh/KWe3b+kC4iA1lrZcxqUM4FUUN3LtbrhUcmoRUTcUNGdMoc9J3750fWXWNNaKTM2YXT0RG9yALCVRKMDIeeN/+GQriH5VBYcxhmLc0VZDUMRKNI2wWKmLrnFET201HwnA6CGN3ZU3gUoZqfCoQCRjqJCiNSfMh3JE+3ZFEwDkWoICRXRialSZWN/tST6c3FCALayUIgsjLQGudXgzCdhGEQBhju8j+gCPNYJhAirWnUYZ4ckD5NKpCu6AIhdn6jk+jVINyuBwfLUWDNgZSa1MUb90Q7rrG0CORWRCfvs8u4JVvFpCX9teb8DyyBfV0JyJD5AAAAAElFTkSuQmCC"
                alt="github"
                class="share-popover-icon"
              />
            </a>
          </div> -->
          <div class="share-popover-item" @click="handleClickShareItem">
            <img
              src="https://fastcdn.mihoyo.com/static-resource-v2/2023/09/06/e933078d70f84f2d50270019641a65bc_2926926410987141994.png"
              alt=""
              class="share-popover-icon"
            />
          </div>
        </div>
      </div>
    </div>
  </ViewModal>
</template>

<style scoped lang="scss">
.share-img {
  // position: absolute;
  // left: 5.63rem;
  // top: 1.51rem;
  width: 13.78rem;
  height: 7.31rem;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
  background-size: cover;
  border-radius: 0.4rem;
  border: 0.12rem solid #392e58;
  background-image: url("https://fastcdn.mihoyo.com/mi18n/nap_cn/m20241113hy3an50268/upload/7ab08bcde8d519b6f957f7f5605e0b41_913778883666944205.png");
}
.github-share {
  display: block;
  width: 1rem;
  height: 1rem;
  position: absolute;
  left: -1.4rem;
  top: 4.7rem;
  border: 0.04em solid #8975bf;
  border-radius: 50%;
  &:hover {
    border-color: #fdd034;
  }
  img {
    display: block;
    width: 100%;
    height: 100%;
  }
}
.share-btn {
  width: 1.16rem;
  height: 1.16rem;
  cursor: pointer;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
  background-image: url(data:image/png;base64,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);
  position: absolute;
  bottom: 0;
  left: -1.5rem;

  .share-popover {
    position: absolute;
    left: -0.26rem;
    top: 1.6rem;
    border: 0.05em solid rgb(103, 84, 140);
    box-shadow: rgba(0, 0, 0, 0.2) 0px 0.02em 0.16em 0px;
    border-radius: 0.3em;
    background-color: rgb(79, 62, 111);
  }

  .share-popover-list {
    display: flex;
    padding: 0.3rem;
    gap: 0.3rem;
  }
  .share-popover-item {
    width: 0.63rem;
    height: 0.64rem;
    border-radius: 50%;
    cursor: pointer;
    flex-shrink: 0;
    position: relative;
    border: 0.04em solid #8975bf;

    &:hover {
      border-color: #fdd034;
    }
  }
  .share-popover-icon {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>
