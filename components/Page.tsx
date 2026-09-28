import React from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { colors } from '@/constants/theme';
import { WebSidebar } from '@/components/WebSidebar';
import { RoleNav } from '@/components/RoleNav';

export function Page({ children, scroll = true, narrow = false }: { children: React.ReactNode; scroll?: boolean; narrow?: boolean }) {
  const { width } = useWindowDimensions();
  const horizontalPadding = width < 420 ? 14 : width < 760 ? 18 : width < 1120 ? 24 : 30;
  const topPadding = width < 760 ? 16 : 26;
  const maxWidth = narrow ? 920 : 1280;
  const innerStyle = [styles.content,{paddingHorizontal:horizontalPadding,paddingTop:topPadding,paddingBottom:Platform.OS==='web'?48:112,maxWidth}];
  const body=<><RoleNav/>{children}</>;
  const content=scroll?<ScrollView style={styles.scroll} contentContainerStyle={innerStyle} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">{body}</ScrollView>:<View style={[...innerStyle,styles.flex]}>{body}</View>;
  return <SafeAreaView style={styles.safe}><View style={styles.shell}><WebSidebar/><View style={styles.main}>{content}</View></View></SafeAreaView>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.background},shell:{flex:1,flexDirection:'row',minWidth:0},main:{flex:1,minWidth:0},scroll:{flex:1},flex:{flex:1},content:{width:'100%',alignSelf:'center',gap:18}});
