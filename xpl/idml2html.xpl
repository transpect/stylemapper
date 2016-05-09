<?xml version="1.0" encoding="UTF-8"?>
<p:declare-step xmlns:p="http://www.w3.org/ns/xproc" 
  xmlns:c="http://www.w3.org/ns/xproc-step"
  xmlns:idml2xml="http://transpect.io/idml2xml" 
  xmlns:dbk="http://docbook.org/ns/docbook"
  xmlns:cx="http://xmlcalabash.com/ns/extensions" 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:tr="http://transpect.io"
  xmlns:hub2htm="http://transpect.io/hub2htm"
  name="idml2html"
  type="idml2xml:html"
  version="1.0"
  >
  <p:output port="result" primary="true">
    <p:pipe port="result" step="hub2htm-convert"></p:pipe>
  </p:output>
  <p:serialization port="result" omit-xml-declaration="false" method="xhtml"/>
  <p:option name="file" required="true">
    <p:documentation>The file to be mapped</p:documentation>
  </p:option>
  <p:option name="main-uri" required="false"/>
  <p:option name="template" required="false"/>
  <p:option name="debug" select="'yes'"/>
  <p:option name="debug-dir-uri" select="'debug'"/>
  <p:option name="status-dir-uri" select="'status'"/>
  <p:option name="temp-dir-uri" required="false" select="'temp'"/>

  <p:import href="http://transpect.io/hub2html/xpl/hub2html.xpl"/>
  <p:import href="http://xmlcalabash.com/extension/steps/library-1.0.xpl"/>
  <p:import href="http://transpect.io/xproc-util/store-debug/xpl/store-debug.xpl"/>
  <p:import href="http://transpect.io/idml2xml/xpl/idml2hub.xpl"/>
  <p:import href="http://transpect.io/idml2xml/xpl/idml_single-doc.xpl"/>
  <p:import href="http://transpect.io/idml2xml/xpl/idml_single2tagged.xpl"/>
  <p:import href="http://transpect.io/idml2xml/xpl/idml_tagged2hub.xpl"/>
  <p:import href="http://transpect.io/cascade/xpl/paths.xpl"/>
  
  <tr:paths name="paths">
    <p:with-option name="pipeline" select="'idml2html'"/>
    <!--    <p:with-option name="interface-language" select="$interface-language"/>-->
<!--        <p:with-option name="clades" select="$clades"/>-->
    <p:with-option name="file" select="$file"/>
    <p:with-option name="debug" select="$debug"/>
    <p:with-option name="debug-dir-uri" select="$debug-dir-uri"/>
    <p:with-option name="progress" select="'yes'"/>
    <p:input port="params"><p:empty/></p:input>
    <p:input port="stylesheet">
      <p:document href="http://transpect.io/cascade/xsl/paths.xsl"/>
    </p:input>
    <p:input port="conf">
      <!--<p:pipe port="conf" step="transpect-custom-paths"/>-->
      <p:document href="http://customers.le-tex.de/generic/book-conversion/conf/transpect-conf.xml"/>
    </p:input>
  </tr:paths>

  <p:sink/>

  <idml2xml:hub name="idml2hub">
    <p:with-option name="idmlfile" select="$file"/>
    <p:with-option name="srcpaths" select="'yes'"/>
    <p:with-option name="debug" select="'yes'"/>
    <p:with-option name="debug-dir-uri" select="'debug'"/>
    <p:with-option name="status-dir-uri" select="'status'"/>
  </idml2xml:hub>
  
  <tr:store-debug pipeline-step="idml2html/idml_hub">
    <p:with-option name="active" select="$debug"/>
    <p:with-option name="base-uri" select="$debug-dir-uri"/>
  </tr:store-debug>
  <p:sink/>

  <p:insert name="add-episode-keyword" match="/*/dbk:info" position="last-child">
    <p:input port="source">
      <p:pipe port="result" step="idml2hub"></p:pipe>
    </p:input>
    <p:input port="insertion">
      <p:inline>
        <keywordset role="stylemapper" xmlns="http://docbook.org/ns/docbook">
          <keyword role="episode"><placeholder/></keyword>
        </keywordset>
      </p:inline>
    </p:input>
  </p:insert>

  <p:string-replace name="set-episode" match="/*/dbk:info/dbk:keywordset[@role ='stylemapper']/dbk:keyword[@role='episode']/dbk:placeholder">
    <p:with-option name="replace" select="concat('''', p:system-property('p:episode'), '_idml','''')"></p:with-option>
  </p:string-replace>
  
  <tr:store-debug pipeline-step="idml2html/hub_with_episode">
    <p:with-option name="active" select="$debug"/>
    <p:with-option name="base-uri" select="$debug-dir-uri"/>
  </tr:store-debug>
  <p:sink/>

  <p:xslt name="docx2hub_extended">
    <p:input port="source">
      <p:pipe port="result" step="set-episode"></p:pipe>
    </p:input>
    <p:input port="stylesheet">
      <p:document href="http://transpect.le-tex.de/stylemapper/xsl/docx2hub_extended.xsl"/>
    </p:input>
    <p:input port="parameters">
      <p:empty/>
    </p:input>
  </p:xslt>

  <tr:store-debug pipeline-step="idml2html/extended_deleted_phrases">
    <p:with-option name="active" select="$debug"/>
    <p:with-option name="base-uri" select="$debug-dir-uri"/>
  </tr:store-debug>
  <p:sink/>

  <p:xslt name="docx2hub_space_comp">
    <p:input port="source">
      <p:pipe port="result" step="docx2hub_extended"/>
    </p:input>
    <p:input port="stylesheet">
      <p:document href="http://transpect.le-tex.de/stylemapper/xsl/docx2hub_space_comp.xsl"/>
    </p:input>
    <p:input port="parameters">
      <p:empty/>
    </p:input>
  </p:xslt>
  
  
  <p:xslt name="add-attributes">
    <p:input port="source"></p:input>
    <p:input port="stylesheet">
      <p:document href="http://transpect.le-tex.de/stylemapper/xsl/add-attributes.xsl"></p:document>
    </p:input>
    <p:input port="parameters">
      <p:empty/>
    </p:input>
  </p:xslt>

  <p:store name="save-hub">
    <p:with-option name="href"
      select="concat($main-uri, '/',p:system-property('p:episode'),'/',p:system-property('p:episode'), '_hub.xml')"/>
  </p:store>
  <hub2htm:convert name="hub2htm-convert">
    <p:input port="source">
      <p:pipe port="result" step="add-attributes"/>
    </p:input>
    <p:input port="paths">
      <p:pipe port="result" step="paths"></p:pipe>
    </p:input>
    <p:input port="other-params">
      <p:inline>
        <c:param-set>
          <c:param name="overwrite-image-paths" value="no"/>
        </c:param-set>
      </p:inline>
    </p:input>
    <p:with-param name="html-title" select="'temp'"/>
    <p:with-option name="debug" select="$debug"/>
    <p:with-option name="debug-dir-uri" select="$debug-dir-uri"/>
    <p:with-option name="status-dir-uri" select="$status-dir-uri"/>
  </hub2htm:convert>
  
  <p:store name="save-xhtml">
    <p:with-option name="href" select="concat($temp-dir-uri,'/', 'source-content.xhtml')"/>
  </p:store>
  <p:identity>
    <p:input port="source">
      <p:pipe port="zip-manifest" step="idml2hub"/>
    </p:input>
  </p:identity>
 
  <p:store name="save-zip-manifest">
    <p:with-option name="href" select="concat($main-uri, '/',p:system-property('p:episode'),'/',p:system-property('p:episode'), '_zip_manifest.xml')"/>
  </p:store>
 
  <p:identity>
    <p:input port="source">
      <p:pipe port="Document" step="idml2hub"></p:pipe>
    </p:input>
  </p:identity>
  
  <p:store name="save-singletree">
    <p:with-option name="href" select="concat($main-uri, '/',p:system-property('p:episode'),'/',p:system-property('p:episode'), '_single_tree.xml')"/>
  </p:store>

  <idml2xml:single-doc name="template-single-tree">
    <p:input port="xslt-stylesheet">
      <p:document href="http://transpect.io/idml2xml/xsl/idml2xml.xsl"></p:document>
    </p:input>
    <p:with-option name="idmlfile" select="$template"/>
    <p:with-option name="srcpaths" select="'yes'"/>  
    <p:with-option name="all-styles" select="'yes'"/>   
    <p:with-option name="debug" select="$debug"/>
      <p:with-option name="debug-dir-uri" select="$debug-dir-uri"/>
    </idml2xml:single-doc>

  <tr:store-debug pipeline-step="idml2html/template-singletree">
    <p:with-option name="active" select="$debug"/>
    <p:with-option name="base-uri" select="$debug-dir-uri"/>
  </tr:store-debug>
  
  <p:xslt name="extract-wstyles">
    <p:input port="stylesheet">
      <p:document href="http://transpect.le-tex.de/stylemapper/xsl/extract-template-styles.xsl"></p:document>
    </p:input>
    <p:input port="parameters">
      <p:empty></p:empty>
    </p:input>    
  </p:xslt>
  <p:store>
  <p:with-option name="href" select="concat($temp-dir-uri,'/template_styles.xml')"></p:with-option>
  </p:store>
</p:declare-step>
