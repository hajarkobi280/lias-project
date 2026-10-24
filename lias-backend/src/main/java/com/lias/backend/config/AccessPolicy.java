package com.lias.backend.config;
import org.springframework.security.core.Authentication;import org.springframework.stereotype.Component;import java.util.Set;
@Component("accessPolicy") public class AccessPolicy {
 public static final Set<String> CATEGORIES=Set.of("EQUIPES","EVENEMENTS","PUBLICATIONS","DOCUMENTS","CONVENTIONS","PV");
 private boolean has(Authentication a,String role){return a!=null&&a.isAuthenticated()&&a.getAuthorities().stream().anyMatch(r->r.getAuthority().equals(role));}
 public boolean isAdmin(Authentication a){return has(a,"ROLE_ADMIN")&&!has(a,"STATUT_DOCTORANT");}
 public boolean isDirecteur(Authentication a){return has(a,"ROLE_DIRECTEUR")&&!has(a,"STATUT_DOCTORANT");}
 public boolean canManageMembers(Authentication a){return isAdmin(a)||isDirecteur(a);}
 public boolean accesInterne(Authentication a){return !isAdmin(a)&&!has(a,"STATUT_DOCTORANT")&&(isDirecteur(a)||has(a,"STATUT_PERMANENT"));}
 public boolean canRead(Authentication a,String c){
  if(isAdmin(a))return false;
  if(c==null||c.isBlank())return accesInterne(a);
  if(!CATEGORIES.contains(c))return false;
  if(has(a,"STATUT_DOCTORANT"))return "PUBLICATIONS".equals(c);
  return accesInterne(a)||(has(a,"STATUT_ASSOCIE")&&Set.of("PUBLICATIONS","EVENEMENTS","EQUIPES").contains(c));
 }
 public boolean canWrite(Authentication a,String c){
  if(isAdmin(a))return false;
  if(!CATEGORIES.contains(c==null?"":c))return false;
  if(has(a,"STATUT_DOCTORANT"))return "PUBLICATIONS".equals(c);
  return accesInterne(a)||(has(a,"STATUT_ASSOCIE")&&"PUBLICATIONS".equals(c));
 }
}
