/* Copyright 2021, Milkdown by Mirone. */
import { Router } from '../route/Router'
import { Layout } from './Layout'
import { DesktopNav, MobileNav, SidePanel } from './Nav'

export const App: React.FC = () => (
  <Layout NavBar={DesktopNav} AppBar={MobileNav} Sidebar={SidePanel}>
    <Router />
  </Layout>
)
