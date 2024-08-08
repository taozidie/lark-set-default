import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import {Alert, AlertProps, Button, Input, Select, message} from 'antd';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <LoadApp/>
  </React.StrictMode>
)
import {
  bitable,
  IAttachmentField,
  CurrencyCode,
  FieldType,
  ICurrencyField,
  ICurrencyFieldMeta,
  IFieldMeta
} from '@lark-base-open/js-sdk';
import { CURRENCY } from './const';
import { getExchangeRate } from './exchange-api';


interface FormData{
  fileId?:string;
  value?:string;
}
function LoadApp() {
  const [info, setInfo] = useState('get table name, please waiting ....');
  const [alertType, setAlertType] = useState<AlertProps['type']>('info');
  const [fieldMetaList, setMetaList] = useState<IFieldMeta[]>([])
  const [selectFieldId, setSelectFieldId] = useState<string>();
  const [defaultVal, setDefaultVal] = useState<string>()
  const [currency, setCurrency] = useState<CurrencyCode>();

  const [formData, setFormData] = useState<FormData>({})
  useEffect(() => {
    const fn = async () => {
      //  获取当前的table
      const table = await bitable.base.getActiveTable();

      //通过字段类型去获取对应的字段信息
      const fieldMetaList = await table.getFieldMetaList();
      setMetaList(fieldMetaList);


      const off = table.onRecordAdd(async (event) => { // 监听字段增加事件
        // console.log('record add', event);
        // message.info(JSON.stringify(event))
        //
        // 1
        if (event.data && event.data.length > 0) {
          for (const recordId of event.data) {
            // message.info(await currentField.getValue(recordId))
            // message.info(`selectFieldId${formData.fileId}`)
            // message.info(`defaultVal${formData.value}`)

            if(formData.fileId && formData.value){
              const curFiled = await table.getField(formData.fileId);
              const res = await table.setCellValue(curFiled.id, recordId, formData.value)
              // message.info(`res${res}`)
            }
            // true
          }
        }
      });
    };
    fn();
  }, []);

  const formatFieldMetaList = (metaList: IFieldMeta[]) => {
    return metaList.map(meta => ({ label: meta.name, value: meta.id }));
  };

  const transform = async () => {
    // 如果用户没有选择货币或者转换的字段，则不进行转换操作
    if (!selectFieldId || !defaultVal) return;
    // const table = await bitable.base.getActiveTable();
    formData.fileId = selectFieldId
    formData.value = defaultVal
    setFormData({...formData})
    message.success(`保存成功`)
  }
  return <div>
    <div style={{ margin: 10 }}>
      <div>选择字段</div>
      <Select style={{ width: 120 }} onSelect={setSelectFieldId} options={formatFieldMetaList(fieldMetaList)}/>
    </div>
    <div style={{ margin: 10 }}>
      <div>设置默认值</div>
      <Input onChange={(e)=>setDefaultVal(e.target.value)}></Input>
    </div>
    <div style={{ margin: 10 }}>
      <Button onClick={transform} disabled={!selectFieldId ||!defaultVal }>确认</Button>
    </div>
  </div>
}
