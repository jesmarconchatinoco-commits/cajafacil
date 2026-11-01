// Pantallas de la app. En React Native no hay archivos HTML: cada archivo de esta carpeta es una vista.
import { Accessibility } from './accesibilidad'
import { Balance } from './balance'
import { Account, AvatarPick, Code, Help, Login, Pin, Register, Settings, Splash } from './cuenta'
import { CobroAmount, CobroPay, FiadoAmount, FiadoName, Fiados, Person } from './fiados'
import { Home } from './inicio'
import { SaleAmount, SaleDetail, SalePay, SaleSaved, Sales } from './venta'

export const screens = {
  splash: Splash,
  register: Register,
  code: Code,
  pin: Pin,
  avatar: AvatarPick,
  login: Login,
  home: Home,
  saleAmount: SaleAmount,
  salePay: SalePay,
  saleSaved: SaleSaved,
  sales: Sales,
  saleDetail: SaleDetail,
  balance: Balance,
  account: Account,
  settings: Settings,
  help: Help,
  a11y: Accessibility,
  fiados: Fiados,
  fiadoName: FiadoName,
  fiadoAmount: FiadoAmount,
  person: Person,
  cobroAmount: CobroAmount,
  cobroPay: CobroPay,
}
