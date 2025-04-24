<script setup lang="ts">
import ViewModal from "./ViewModal.vue"

import throttle from "lodash/throttle"

const icGithub =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABACAYAAACunKHjAAAAAXNSR0IArs4c6QAABApJREFUeF7tm112GyEMhc1iuo42j11VmpU1WRmNKJojGH50JSbGPslLzrEZQB9XEmhwuH3BX4zxVx6G//8Uw/Jn7/mzD/HdewiBP790puGq3rPxZCQZzcZah3ujB0MIf6wdzJ5bCiIb/1qt/mwO6PekkI/VUJaBiDH+XbDyKJS3VUDcIGKMJFdWAWrIqvZuIGYQmwCQICmOmIOrCcSGEAogFneBQdwpFqAuBLuKGoTICN5UiBplbQ/BUIHIECgrPNofxYwXzaSnIB4YAtuvgqEBETVEN28zdZMhiAcJjNo1GMLoglCmyLTdzTO5x6ZKHtQ047/0DnFNEEoIZH9BWRy0NJPSrmTdjoyncYtTqVa94XOT0Rq4B0IVF3qd0kAATARIV95AUG/2cQIBGDCNxqIvXj0+Tg9rDEJZBCnVLmZpEABB3Z1cpAVCpYa8r1flaGTJPW3jJ3nl86dFLEAAaqDxpopQTmpZMwDESRU1CC3RZwBRLOQBAlTDdiDAGMEqPGKFBIGoIXU0yhrL9K7syLCQhXskEEaau4GgUzF6MDzcg0FYym3T/btyMZc1026qqgGTezAItPC6HQQ2Dswch3swCCg+7BQbajkZYkVyj2B4cFs1WFVBC/usICBXN4HY2S2EItDg/4MUAdNbFuYv6sjg7k8LAt1TJBBPkzGEa6Agfj8rCDRGfIPIKkogoGDZqu5cFPPM3RqC5TcIjyK2q0w1ttlQArjdbnj63LFEJ0EYSwoJBBphT/U+szNf8KDFHt5iozl3uzJdpQjULf6fPnOFCn14S1VY1MBv66yFme1UYYwNZEcqK3hKdUcnF7g63CV6VOAB+DTtKt7mzu5aqHFeaTrmLsv56A5TrlrzDTW8rOADxpggR2mCGGUPvgcxe93vuuuo5eBUwTGMLDLVr/xaqih2ksqzyXGBxHLnsbFT5Jt8tBCrbvUVLq19Cdy6EIJOqntbpaWEVaveU1ldckSvBSRjxO8v1G+WLLVOR0qcedkpwLdADHeabBB4TcicWZSuODO8+L61KL2rQ6MMkmIGRWzyf03ktqiBZ36BKnRXh/KWe3b+kC4iA1lrZcxqUM4FUUN3LtbrhUcmoRUTcUNGdMoc9J3750fWXWNNaKTM2YXT0RG9yALCVRKMDIeeN/+GQriH5VBYcxhmLc0VZDUMRKNI2wWKmLrnFET201HwnA6CGN3ZU3gUoZqfCoQCRjqJCiNSfMh3JE+3ZFEwDkWoICRXRialSZWN/tST6c3FCALayUIgsjLQGudXgzCdhGEQBhju8j+gCPNYJhAirWnUYZ4ckD5NKpCu6AIhdn6jk+jVINyuBwfLUWDNgZSa1MUb90Q7rrG0CORWRCfvs8u4JVvFpCX9teb8DyyBfV0JyJD5AAAAAElFTkSuQmCC"

const { visite } = defineProps({
  visite: Boolean,
})

const emits = defineEmits(["clickByMask"])

// const [visPoppver, { toggle: togglePoppver }] = useBoolean(false)

// const handleClickShareItem = throttle(
//   () => {
//     copyToClipboard(window.location.href)
//   },
//   500,
//   { trailing: false },
// )

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
        :src="icGithub"
        alt="github"
        class="share-popover-icon"
      />
    </a>
    <!-- <div
      class="share-btn"
      @click="togglePoppver"
      :style="{ backgroundImage: `url(${icSreStar64})` }"
    >
      <div class="share-popover" v-if="visPoppver">
        <div class="share-popover-list">
          <div class="share-popover-item">
            <a href="https://github.com/cleves0315/ZZZEvent-ADreamComeTrueAtLast" target="_blank">
              <img
                style="border-radius: 50%; background-color: #000"
                :src="icGithub"
                alt="github"
                class="share-popover-icon"
              />
            </a>
          </div>
          <div class="share-popover-item" @click="handleClickShareItem">
          </div>
        </div>
      </div>
    </div> -->
  </ViewModal>
</template>

<style scoped lang="scss">
.share-img {
  width: 13.78rem;
  height: 7.31rem;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
  background-size: cover;
  border-radius: 0.4rem;
  border: 0.12rem solid #392e58;
  background-image: url(/share.png);
}
.github-share {
  display: block;
  width: 0.8rem;
  height: 0.8rem;
  position: absolute;
  left: -1.1rem;
  bottom: 0;
  border-radius: 50%;
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
