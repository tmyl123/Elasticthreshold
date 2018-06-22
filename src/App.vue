<template>
  <div id="app">
    <b-container>
      <b-row class="header-row">
        <b-col></b-col>
        <b-col>
          <b-alert :show="dismissCountDown"
             dismissible
             :variant="alertVariant"
             @dismissed="dismissCountDown=0"
             @dismiss-count-down="countDownChanged">
            {{ alertText }}
          </b-alert>
        </b-col>
        <b-col></b-col>
      </b-row>
    <!-- Content here -->
    </b-container>
   <b-container fluid class="bv-example-row">
      <b-row>
        <b-table 
          striped 
          hover 
          :items="allconfigs"
          :fields="tablefields"
          >
        <template slot="cron" slot-scope="row">
          <b-button-group>
            <b-button size="sm" variant="success" v-show="!row.item.status.isrunning" @click.stop="toggleStat(row.item, row.index, $event.target)" class="mr-2">Start</b-button>
            <b-button size="sm" variant="danger" v-show="row.item.status.isrunning" @click.stop="toggleStat(row.item, row.index, $event.target)" class="mr-2">Stop</b-button>
          </b-button-group>
        </template>
        <template slot="edit_item" slot-scope="row">
          <b-button-group>
            <b-button size="sm" variant="primary" v-show="!row.item.status.isediting" @click.stop="edit(row.item, row.index, $event.target)" class="mr-2">edit</b-button>
            <b-button size="sm" variant="primary" v-show="row.item.status.isediting" @click.stop="save(row.item, row.index, $event.target)" class="mr-2">save</b-button>
            <b-button size="sm" variant="primary" @click.stop="copy(row.item, row.index, $event.target)" class="mr-2">copy</b-button>
            <b-button size="sm" variant="danger" @click.stop="remove(row.item, row.index, $event.target)" class="mr-2">remove</b-button>
          </b-button-group>
        </template>
        <template slot="run_test" slot-scope="row">
          <b-button-group>
            <b-button size="sm" variant="info" @click.stop="test(row.item, row.index, $event.target)" class="mr-2">test</b-button>
          </b-button-group>
        </template>
        <template slot="ismet" slot-scope="row">
          {{ pseudoStat[row.index].ismet }}
        </template>
        <template slot="timer" slot-scope="row">
          <!--        {{ allconfigs[row.index].status.runTimer }}-->
          {{ pseudoStat[row.index].runTimer }}
        </template>
        <template slot="period" slot-scope="row">
          <!--        {{ allconfigs[row.index].status.period }}-->
          {{ pseudoStat[row.index].period }}
        </template>
        <template slot="view" slot-scope="row">
					<b-btn :id="'config' + row.index">?</b-btn>
					<b-tooltip 
						:target="'config' + row.index" 
						:title="itemtooltips(row.item)"
						placement="right"
						></b-tooltip>
        </template>
        </b-table>
      </b-row>
			<b-row>
        <b-col>
          <pre v-html="testResult"></pre>
				</b-col>
        <b-col cols="5">
          <b-row>
              <b-col>
                <b-input-group prepend="Name">
                  <b-form-input type="text" v-model="editingItem.name"></b-form-input>
                </b-input-group>
              </b-col>
          </b-row>
          <b-row>
              <b-col>
                <b-input-group prepend="Interval">
                  <b-form-input type="number" v-model="editingItem.interval"></b-form-input>
                </b-input-group>
              </b-col>
          </b-row>
          <b-row>
              <b-col>
                <b-input-group prepend="Elhost">
                  <b-form-input type="text" v-model="editingItem.elhost"></b-form-input>
                </b-input-group>
              </b-col>
          </b-row>
          <b-row>
              <b-col>
                <b-input-group prepend="Elport">
                  <b-form-input type="text" v-model="editingItem.elport"></b-form-input>
                </b-input-group>
              </b-col>
          </b-row>
          <b-row>
              <b-col>
                <b-input-group prepend="Datepat">
                  <b-form-select v-model="editingItem.datepat" :options="datepatoptions"/>
                </b-input-group>
              </b-col>
          </b-row>
          <b-row>
              <b-col>
                <b-input-group prepend="Index">
                  <b-form-input type="text" v-model="editingItem.index"></b-form-input>
                </b-input-group>
              </b-col>
          </b-row>
          <b-row>
              <b-col>
                <b-input-group prepend="Comparemode">
                  <b-form-select v-model="editingItem.compareMode" :options="compareModeoptions"/>
                </b-input-group>
              </b-col>
          </b-row>
          <b-row>
              <b-col>
                <b-input-group prepend="Threshold">
                  <b-form-input type="text" v-model="editingItem.threshold"></b-form-input>
                </b-input-group>
              </b-col>
          </b-row>
          <b-row>
              <b-col>
                <b-input-group prepend="OP">
                  <b-form-select v-model="editingItem.op" :options="opoptions"/>
                </b-input-group>
              </b-col>
          </b-row>
          <b-row>
              <b-col>
                <b-input-group prepend="Postcontent">
                  <b-form-textarea :rows="6" v-model="postContent"></b-form-textarea>
                </b-input-group>
              </b-col>
          </b-row>
          <b-row>
              <b-col>
                <b-input-group prepend="Sendmail">
                  <b-form-select v-model="editingItem.sendMail" :options="booloptions"/>
                </b-input-group>
              </b-col>
          </b-row>
          <template v-if="editingItem.sendMail">
            <b-row>
                <b-col>
                  <b-input-group prepend="Mailservice">
                    <b-form-input type="text" v-model="editingItem.mailService"></b-form-input>
                  </b-input-group>
                </b-col>
            </b-row>
            <b-row>
                <b-col>
                  <b-input-group prepend="Mailuser">
                    <b-form-input type="text" v-model="editingItem.mailUser"></b-form-input>
                  </b-input-group>
                </b-col>
            </b-row>
            <b-row>
                <b-col>
                  <b-input-group prepend="Mailpass">
                    <b-form-input type="text" v-model="editingItem.mailPass"></b-form-input>
                  </b-input-group>
                </b-col>
            </b-row>
            <b-row>
                <b-col>
                  <b-input-group prepend="Mailto">
                    <b-form-input type="text" v-model="editingItem.mailTo"></b-form-input>
                  </b-input-group>
                </b-col>
            </b-row>
            <b-row>
                <b-col>
                  <b-input-group prepend="Mailtemplate">
                    <b-form-select v-model="editingItem.mailbody" :options="mailbodyoptions"/>
                  </b-input-group>
                </b-col>
            </b-row>
            <b-row>
                <template v-for="(interest, index) in editingItem.interestedField">
                <b-col sm="12">
                  <b-input-group prepend="Interested Field">
                    <b-form-input type="text" v-model="editingItem.interestedField[index]"></b-form-input>
                    <b-button-group slot="append">
                      <b-button size="sm" 
                              @click="editingItem.interestedField.splice(index, 1)">-</b-button>
                      <b-button size="sm" 
                              v-show="isLastItem(editingItem.interestedField, index)"
                              @click="editingItem.interestedField.push('')"
                              >+</b-button>
                    </b-button-group>
                  </b-input-group>
                </b-col>
                </template>
            </b-row>
            <b-row>
                <b-col>
                  <b-input-group prepend="Mailsubject">
                    <b-form-input type="text" v-model="editingItem.mailSubject"></b-form-input>
                  </b-input-group>
                </b-col>
            </b-row>
            <b-row>
                <b-col>
                  <b-input-group prepend="Ref Link">
                    <b-form-input type="text" v-model="editingItem.referenceLink"></b-form-input>
                  </b-input-group>
                </b-col>
            </b-row>
            <b-row>
                <b-col>
                  <b-input-group prepend="Mail Body">
                    <b-form-textarea :rows="6" v-model="editingItem.extraMailBody"></b-form-textarea>
                  </b-input-group>
                </b-col>
            </b-row>
          </template>
            <b-row>
                <b-col v-show="!isediting">
                  <b-button variant="success" @click="add" class="mr-2">ADD</b-button>
                </b-col>
            </b-row>
				</b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue);

var backendUrl = "http://" + window.location.hostname + ":" + "3000"

import VueSocketio from 'vue-socket.io';
Vue.use(VueSocketio, backendUrl); 

import axios from 'axios'

export default {
  name: 'App',
  components: {},
  data() {
    return {
      datepatoptions: ["daily"],
      booloptions: [true, false],
      compareModeoptions: ["hit", "agg"],
      opoptions: [">", "<", "==", "!=="],
      alertText: "",
      alertVariant: "",
      dismissCountDown: 0,
      showDismissibleAlert: false,
      allconfigs: [],
      tablefields: [ 
//        {key: 'name', sortable: true},
        'name',
        'interval',
        'cron',
        'edit_item',
        'run_test',
        'ismet',
        'timer',
        'period',
				'view'
      ],
      postContent: "",
      originItemName: "",
      editingItem: {
        interestedField: ['']
      },
      testResult: "",
      pseudoStat: [],
      configstatus: {
        "isediting": false,
        "isrunning": false,
        "timer": 0,
        "runTimer": 0,
        "period": 0,
        "ismet": false,
        "passtest": false
      },
      mailbodyoptions: []
    }
  },
  methods: {
      countDownChanged (dismissCountDown) {
      this.dismissCountDown = dismissCountDown
    },
    showAlert (info) {
      this.alertVariant = info.variant
      this.alertText = info.text
      this.dismissCountDown = 3
    },
    getAllConf() {

       axios.get(backendUrl + '/getallconf').then(res => {

         //KEEP TABLE SORT DEFAULT
         res.data.sort(function(a, b) {
           var nameA = a.name.toUpperCase();
           var nameB = b.name.toUpperCase();
           if (nameA < nameB) {
             return -1;
           }
           if (nameA > nameB) {
             return 1;
           }
         
           return 0;
         });

          this.allconfigs = res.data

          //TEMPORARY
          //TABLE WILL COMPLAIN UNDEFINED, SO WE DEFINED FIRST
          this.pseudoStat = res.data.map(config => {
            var obj = {}
            obj.runTimer = config.status.runTimer
            obj.period   = config.status.period
            obj.ismet    = config.status.ismet
            return obj
          })

       })
    },
    edit(item, index, button) {

      item.status.passtest = false

      if (item.status.isrunning) {
        this.showAlert({variant: "danger", text: "Please stop cron first"})
      } else {
        this.allconfigs.forEach(config => {
          config.status.isediting = false
        })
        item.status.isediting = true
        this.originItemName = item.name
        this.editingItem = item
        this.postContent = JSON.stringify(item.postContent, undefined, 2)
        //EDIT CONFIG; THIS IS USED TO BROCAST THAT SOMEONE IS EDITING
        // == THIS IS NOT USEFUL AT ALL ==
        //axios.post('http://127.0.0.1:3000/editconf', {
        //  item: item,
        //  originItemName: self.originItemName
        //}).then(res => {
        //  self.$socket.emit("changeconfig", "edit");
        //})
      }
    },
    save(item, index, button) {
      var self = this
      if (!this.isValid(item)) {
        this.showAlert({ variant: "danger", text: "config not valid!" })
      }  else {
        item.status.isediting = false
        item.postContent = JSON.parse(this.postContent)
        console.log(item.postContent.query)
        axios.post(backendUrl + '/saveconf', {
          item: item,
          originItemName: self.originItemName
        }).then(res => {
          self.editingItem = { interestedField: [''] }
          self.postContent = ""
          self.originItemName = ""
          self.$socket.emit("changeconfig", "save");
        })
      }
    },
    add() {
      var self = this,
          item = this.editingItem

      item.postContent = JSON.parse(this.postContent)
      //MANUALLY ADD CONFIG DOESNT STATUS, WE HAVE TO BUILD THEM
      item.status = this.configstatus
      
      axios.post(backendUrl + '/addconf', {
        item: item,
      }).then(res => {
        self.editingItem = {}
        self.postContent = ""
        self.originItemName = ""
        self.$socket.emit("changeconfig", "add");
      })
    },
    copy(item, index, button) {
      var self = this
      if (item.status.isrunning) {
        this.showAlert({variant: "danger", text: "Please stop cron first"})
      } else {
        axios.post(backendUrl + '/copyconf', {
          item: item
        }).then(res => {
          self.$socket.emit("changeconfig", "copy");
        })
      }
    },
    remove(item, index, button) {
      var self = this
      if (item.status.isrunning) {
        this.showAlert({variant: "danger", text: "Please stop cron first"})
      } else {
        axios.post(backendUrl + '/removeconf', {
          item: item
        }).then(res => {
          self.$socket.emit("changeconfig", "remove");
        })
      }
    },
    test(item, index, button) {
      var self = this
      axios.post(backendUrl + '/testconf', {
        item: item,
      }).then(res => {
        console.log('test done')

        //ERROR HANDLING
        if (!res.data.hasOwnProperty("summary")) {

        //ERROR HANDLE: APP, NETWORK ERROR
          if (res.data.errno) {
            this.showAlert({variant: "danger", text: res.data.code})

          //ERROR HANDLE: BODY ERROR
          } else if (res.data.type) {
            this.showAlert({variant: "danger", text: res.data.reason})

          //UNKOWN ERROR
          } else {
            this.showAlert({variant: "danger", text: res.data})
          }

        item.status.passtest = false
        } else {
          //ALERT FOR METTING THRESHOLD OR NOT
          if (res.data.summary.ismet) {
            this.showAlert({variant: "danger", text: "ismet: true"})
          } else {
            this.showAlert({variant: "success", text: "ismet: false"})
          }
        
        item.status.passtest = true
        }
        self.testResult = JSON.stringify(res.data, undefined, 2)
       })
    },
    toggleStat(item, index, button) {
      var self = this
      //USER MUST PASS CONFIG TEST FIRST
      if (!item.status.passtest && !item.status.isrunning) {
        self.showAlert({variant: "danger", text: "Please pass test first"})
      //AS WELL AS SAVING CONFIG
      } else if (item.status.isediting) {
        console.log('user start with edit')
        self.showAlert({variant: "danger", text: "Please save config before start"})
      } else {
        item.status.isrunning = !item.status.isrunning
        if (!item.status.isrunning) {
          item.status.runTimer  = 0
        }
        axios.post(backendUrl + '/togglecron', {
          item: item
        }).then(res => {
          console.log('stat changed')
          if (item.status.isrunning) {
            self.showAlert({variant: "success", text: "Start Cron"})
          } else if (!item.status.isrunning) {
            self.showAlert({variant: "success", text: "Stop Cron"})
          }
          self.$socket.emit("changeconfig", "toggleStat");
         })
      }
    },
    //IF SOMEONE QUIT WITHIN EDITING, WE ROLL BACK
    //rollBack() {
    //},
    isLastItem(array, index) {
      if (index == (array.length - 1)) {
        return true
      } else {
        return false
      }
    },
    isValid(item) {
      var invalid = 0
      var samename = 0

      //IF CONFIG IS SAME AS OTHERS
      this.allconfigs.forEach(config => {
        if (config.name == item.name) {
          console.log(config.name, item.name)
          samename ++
        }
      })

      //RENAME CONFIG DOESN'T COUNT
      if (this.originItemName == item.name) {
        samename --  
      }

      if (samename > 1) {
        invalid ++
      }

      //IF JSON IS NOT VALID
      try {
        JSON.parse(this.postContent);
      } catch (e) {
        invalid ++
      }

      if (invalid > 0) {
        return false
      } else {
        return true
      }
    },
    getMailTemplate() {
       axios.get(backendUrl + '/getmailtemplate').then(res => {
          this.mailbodyoptions = res.data
       })
    },
		itemtooltips(item) {
			var prettyitem = ""
			prettyitem += 'Name: ' + item.name + '\n'
			prettyitem += 'Interval: ' + item.interval + '\n'
			prettyitem += 'Elastic: ' + item.elhost + ':' + item.elport + '\n'
			prettyitem += 'Datepat: ' + item.datepat + '\n'
			prettyitem += 'Index: ' + item.index + '\n'
			prettyitem += 'Comparemode: ' + item.compareMode + '\n'
			prettyitem += 'Threshold: ' + item.threshold + '\n'
			prettyitem += 'OP: ' + item.op + '\n'
			prettyitem += 'Interested: ' + item.interestedField + '\n'
			prettyitem += 'PostContent: ' + JSON.stringify(item.postContent) + '\n'
			prettyitem += 'Sendmail: ' + item.sendMail + '\n'
			prettyitem += 'Mailservice: ' + item.mailService + '\n'
			prettyitem += 'Mailuser: ' + item.mailUser + '\n'
			prettyitem += 'Mailpass: ' + item.mailPass + '\n'
			prettyitem += 'Mailto: ' + item.mailTo + '\n'
			prettyitem += 'Mailtemplate: ' + item.mailbody + '\n'
			prettyitem += 'Mailsubject: ' + item.mailSubject + '\n'
			prettyitem += 'Ref link: ' + item.referenceLink + '\n'
			prettyitem += 'Mail body: ' + item.extraMailBody + '\n'
		  return prettyitem
		}
  },
  mounted() {
    var self = this
    console.log("mount")
    setInterval(function() {
      self.$socket.emit("getAllStat");
    }, 1000)
    this.getAllConf()
    this.getMailTemplate()
    this.$socket.emit("getAllStat");
  },
  computed: {
    isediting() {
      return this.allconfigs.find(e => {
        return e.status.isediting == true
      })
    }
  },
    sockets: {
    connect: function() {
      console.log('socket connected!')
    },
    changeconfig: function(operation) {
      console.log("socket: config chaged!!")
      console.log("socket: someone " + operation)
      this.showAlert({
        variant: "warning",
        text: "config changed: someone " + operation + "configs"
      })
      this.getAllConf();
    },
    resAllStat: function(allconfigs) {
      //KEEP TABLE SORT DEFAULT
      allconfigs.sort(function(a, b) {
        var nameA = a.name.toUpperCase();
        var nameB = b.name.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
      
        return 0;
      });

      //console.log(allconfigs)
      // this.allconfigs = allconfigs
      this.pseudoStat = allconfigs.map((config, i) => {
        var obj = {}
        obj.runTimer = config.status.runTimer
        obj.period   = config.status.period
        obj.ismet    = config.status.ismet

        //MAKE CELL VARIANTS AFTER GETTING STAT
        this.allconfigs[i]._cellVariants = {}
        if (config.status.ismet) {
          this.allconfigs[i]._cellVariants.ismet = "danger"
        } else {
          this.allconfigs[i]._cellVariants.ismet = "success"
        }

        return obj
      })
    }
  }
}
</script>

<style>
  .header-row {
    height: 80px;
  }
	.tooltip-inner {
    max-width: 400px;
    padding: 0.25rem 0.5rem;
    color: #fff;
    text-align: left;
    background-color: #000;
    border-radius: 0.25rem;
  }
</style>
