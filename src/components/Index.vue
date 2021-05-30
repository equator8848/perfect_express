<template>
  <div id="container">
    <div id="page-title">
      <div>
        <h2>毕业季快递价格对比</h2>
      </div>
    </div>
    <div id="parameter-setting">
      <el-select v-model="schoolId" filterable placeholder="请选择学校" @change="pickSchool">
        <el-option
          v-for="item in schoolOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
      <el-select v-model="targetId" filterable placeholder="请选择快递目的地" @change="pickTarget">
        <el-option
          v-for="item in targetOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-input
        placeholder="请输入快递重量（斤）"
        v-model="weight"
        clearable>
      </el-input>
      <el-button type="primary" @click="calculate">计算</el-button>
    </div>
    <div id="display-board" v-if="displayBoard">
      <h5>
        yyds，{{perfectResult.perfectExpress}}：总共费用约{{perfectResult.perfectExpressCost}}元
      </h5>
      <div v-for="item in calculateResultList">
        <span>{{item.express}}</span>：<span>{{item.expressCost}}</span>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Index',
    data() {
      return {
        schoolId: undefined,
        schoolOptions: undefined,
        targetId: undefined,
        targetOptions: undefined,
        weight: undefined,
        expressPriceMap: undefined,
        targetPriceList: undefined,
        calculateResultList: undefined,
        perfectResult: undefined,
        displayBoard: false
      }
    },
    mounted() {
      this.initOptions();
    },
    methods: {
      obj2Map(obj) {
        let map = new Map();
        for (let key in obj) {
          map.set(key, obj[key]);
        }
        return map;
      },
      map2Options(inputMap) {
        let options = [];
        inputMap.forEach((v, k) => {
          options.push({
            label: k,
            value: v
          })
        });
        return options
      },
      initOptions() {
        this.$httpUtil.get('/static/meta.json').then((response) => {
          let schoolIdMap = this.obj2Map(response.school_id_map);
          let targetIdMap = this.obj2Map(response.target_id_map);
          this.schoolOptions = this.map2Options(schoolIdMap);
          this.targetOptions = this.map2Options(targetIdMap);
        })
      },
      pickSchool(nowVal) {
        console.log(`选择了学校${nowVal}`);
        this.$httpUtil.get(`/static/${nowVal}.json`).then((response) => {
          this.expressPriceMap = this.obj2Map(response);
          if (this.targetId !== undefined) {
            // 可能只修改学校而没改变目的地
            console.log("重新调用pickTarget")
            this.pickTarget(this.targetId);
          }
        });
      },
      pickTarget(nowVal) {
        console.log(`选择了目的地${nowVal}`);
        let priceList = [];
        this.expressPriceMap.forEach((v, k) => {
          priceList.push({
            express: k,
            price: v[nowVal]
          })
        });
        this.targetPriceList = priceList;
      },
      calculate() {
        this.displayBoard = false;
        let resultList = [];
        let perfectExpress = "", perfectExpressCost = 10000;
        for (let i = 0; i < this.targetPriceList.length; i++) {
          let tempResult = 0;
          let weight = this.weight;
          // console.log(this.targetPriceList[i]);
          let stepPriceList = this.targetPriceList[i].price.step_price;
          // 排序
          stepPriceList.sort((a, b) => {
            return a.ceiling - b.ceiling
          });
          for (let j = 0; j < stepPriceList.length; j++) {
            let stepPrice = stepPriceList[j];
            if (stepPrice.price_type === 1) {
              // 首重计算，理论上只会进入一次
              if (weight <= stepPrice.ceiling) {
                // 没有超过首重
                tempResult = stepPrice.price;
                break;
              } else {
                // 超过首重
                tempResult += stepPrice.price;
              }
            } else if (stepPrice.price_type === 2) {
              if (weight <= stepPrice.ceiling) {
                tempResult += (weight - stepPriceList[j - 1].ceiling) * stepPrice.price;
                break;
              } else {
                tempResult += (stepPrice.ceiling - stepPriceList[j - 1].ceiling) * stepPrice.price;
              }
            }
            console.log(i, j, tempResult);
          }
          // 计算折扣
          tempResult *= this.targetPriceList[i].price.discount;
          resultList.push({
            expressCost: tempResult.toFixed(2),
            express: this.targetPriceList[i].express
          });
          if (tempResult < perfectExpressCost) {
            perfectExpressCost = tempResult.toFixed(2);
            perfectExpress = this.targetPriceList[i].express;
          }
        }
        console.log(resultList);
        this.calculateResultList = resultList;
        this.perfectResult = {
          perfectExpress,
          perfectExpressCost
        };
        this.displayBoard = true;
      }
    }
  }
</script>

<style scoped lang="less">
  #container {
    #page-title {
      width: 100%;
      height: 128px;
      line-height: 128px;
      text-align: center;
      background: #409EFF;
      color: white;
    }

    #parameter-setting {
      background-color: palegoldenrod;
      display: flex;
      flex-direction: column;
      align-content: center;
    }

    #display-board {
      margin-top: 8%;
      text-align: center;
    }
  }
</style>
