
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { useTranslation } from 'next-i18next'

import useLocalStorage from '../utils/useLocalStorage'
import { Switch } from 'antd'

export const layouts: Array<{ id: number; name: 'Grid' | 'List'; icon: IconProp }> = [
  { id: 1, name: 'List', icon: 'th-list' },
  { id: 2, name: 'Grid', icon: 'th' },
]

const SwitchLayout = () => {
  const [preferredLayout, setPreferredLayout] = useLocalStorage('preferredLayout', layouts[0])

  const { t } = useTranslation()
  const changeLayout=(checked:boolean,_e: any)=>{
    if(checked){
      setPreferredLayout(layouts[0])
    }else{
      setPreferredLayout(layouts[1])
    }
  }

  return (
     <Switch checkedChildren={t('List')} unCheckedChildren={t('Grid')} defaultChecked onChange={changeLayout} style={{backgroundColor:'rgb(14 165 233)'}}/>
      
  )
}

export default SwitchLayout
