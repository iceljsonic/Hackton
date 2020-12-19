
var record1 = {
    id: 0,
    customerName: "Chris J LIU",
    accountNumber: "0010101",
    emailAddress: "chris.j.liu@hsbc.com",
    phoneNumber: "8612345678901"
}
var record2 = {
    id: 1,
    customerName: "Chris J LIU",
    accountNumber: "0010101",
    emailAddress: "chris.j.liu@hsbc.com",
    phoneNumber: "8612345678901"
}
var record3 = {
    id: 4,
    customerName: "Chris J LIU",
    accountNumber: "0010101",
    emailAddress: "chris.j.liu@hsbc.com",
    phoneNumber: "8612345678901"
}
var record4 = {
    id: 5,
    customerName: "Chris J LIU",
    accountNumber: "0010101",
    emailAddress: "chris.j.liu@hsbc.com",
    phoneNumber: "8612345678901"
}
function readWorkbookFromLocalFile(file, callback) {
    var fileReader = new FileReader();

    fileReader.onload = function (ev) {
        try {
            var data = ev.target.result
            var workbook = XLSX.read(data, {
                type: 'binary'
            }) // 以二进制流方式读取得到整份excel表格对象
            var persons = []; // 存储获取到的数据
        } catch (e) {
            console.log('文件类型不正确');
            return;
        }
        // 表格的表格范围，可用于判断表头是否数量是否正确
        var fromTo = '';
        // 遍历每张表读取
        console.log(workbook)
        for (var sheet in workbook.Sheets) {
            if (workbook.Sheets.hasOwnProperty(sheet)) {
                fromTo = workbook.Sheets[sheet]['!ref'];
                let tmpResult = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
                persons = persons.concat(tmpResult);
                break; // 如果只取第一张表，就取消注释这行
            }
        }
        if (callback) callback(persons);
        //在控制台打印出来表格中的数据
    };
    // 以二进制方式打开文件
    fileReader.readAsBinaryString(file);
}

class Record {
    constructor(id, customerName = "", accountNumber = "", emailAddress = "", phoneNumber = "") {
        this.id = id;
        this.customerName = customerName;
        this.accountNumber = accountNumber;
        this.emailAddress = emailAddress;
        this.phoneNumber = phoneNumber;
    }
}
var record0 = new Record(0, "Jerry S Q WANG")

var app = new Vue({
    el: "#app",
    data: {
        recordList: [record1,record2],
        submitTitle: "Submit",
        selectedRecordsIndexSet: [0,1],
        isShowMapFieldModalView: false,
        mapping: {
            customerName: "customerName",
            accountNumber: "accountNumber",
            emailAddress: "emailAddress",
            phoneNumber: "phoneNumber"
        },
        originalExcelSheetData: [],
        selectedFile: undefined,
        isShowSMSPreview:false,
        isShowEmailPreview:false,
        currentFocusedRecordIndex: -1,
    },
    computed: {
        fileName: function(){
            if (this.selectedFile === undefined){
                return "Please select the excel document, acceptable extension .csv .xlsx .xls";
            }
            return this.selectedFile.name;
        },
        step: function(){
            if (this.selectedFile === undefined){
                return "Upload File";
            }
            return "Review records";
        },
        displayTable: function () {
            return this.recordList.length > 0;
        },
        displaySubmitButton: function () {
            return this.selectedRecordsIndexSet.length > 0;
        },
        isSelectedAll: {
            get: function () {
                return this.selectedRecordsIndexSet.length === this.recordList.length;
            },
            set: function (val) {
                if (val === false) {
                    this.selectedRecordsIndexSet = [];
                    return;
                }
                this.selectedRecordsIndexSet = this.recordList.map((item) => {
                    return item.id;
                });
            }
        },
        availableKeysInSelectedRecords: function(){
            if (this.originalExcelSheetData.length == 0) {
                return [];
            }
            return Object.keys(this.originalExcelSheetData[0]);
        },
        currentFocusedRecord: function(){
            return this.recordList[this.currentFocusedRecordIndex];
        }
    },
    methods: {
        uploadedFile: function (event) {
            var files = event.target.files;
            var file = files[0];
            if (file === undefined) {
                return;
            }
            this.selectedFile = file;
            var vm = this;
            readWorkbookFromLocalFile(file, function (records) {
                if (records.length == 0) {
                    return;
                }
                vm.originalExcelSheetData = records;
                let firstItem = records[0];
                let kCustomerName = vm.mapping.customerName;

                if (firstItem[kCustomerName] === undefined) {
                    vm.isShowMapFieldModalView = true
                    return;
                }
                vm.makeUpRecordList();
            });
        },
        makeUpRecordList: function () {
            this.isShowMapFieldModalView = false;
            var list = [];
            this.originalExcelSheetData.forEach((value, index) => {
                console.log(value);
                let kCustomerName = this.mapping.customerName
                let kAccountNumber = this.mapping.accountNumber
                let kEmailAddress = this.mapping.emailAddress
                let kPhoneNumber = this.mapping.phoneNumber
                console.log(kCustomerName);
                var item = new Record(0, value[kCustomerName], value[kAccountNumber], value[kEmailAddress], value[kPhoneNumber]);
                list.push(item);
            });
            var tmpArr = this.recordList.concat(list);
            var result = [];
            for (var i = 0; i < tmpArr.length; i++) {
                let item = tmpArr[i];
                let index = result.findIndex(function(value){
                    return value.customerName === item.customerName && value.accountNumber === item.accountNumber && value.emailAddress === item.emailAddress && value.phoneNumber === item.phoneNumber;
                });
                if (index == -1){
                    result.push(tmpArr[i]);
                } 
            }
            this.recordList=result.map((item,index) => {
                var tmpItem = item;
                tmpItem.id = index;
                return tmpItem;
            });
        },
        sendMailAndMessage: function () {
            this.submitTitle = "sending...";
            let result = this.recordList.filter((item) => {
                return this.selectedRecordsIndexSet.indexOf(item.id) != -1;
            });
            console.log(result);
        },
        backToInitalState: function() {
            this.isShowMapFieldModalView = false;
            this.file = undefined;
            this.originalExcelSheetData = [];
        },
        previewEmail: function(id){
            this.currentFocusedRecordIndex = id
            this.isShowEmailPreview = true
        },
        previewSMS: function(id){
            this.currentFocusedRecordIndex = id
            this.isShowSMSPreview = true
        },
        dismissPreview: function(){
            this.isShowSMSPreview = false
            this.isShowEmailPreview = false
        },
    },
})