/* Copyright 2021, Milkdown by Mirone. */
import { Router } from '../route/Router'
import { Layout } from './Layout'
import { DesktopNav, MobileNav } from './Nav'

export const App: React.FC = () => (
  <Layout Sidebar={DesktopNav} AppBar={MobileNav}>
    <Router />
  </Layout>
)
