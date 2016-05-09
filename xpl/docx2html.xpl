<?xml version="1.0" encoding="UTF-8"?>
<p:declare-step xmlns:p="http://www.w3.org/ns/xproc"
  xmlns:c="http://www.w3.org/ns/xproc-step" version="1.0"
  xmlns:cx="http://xmlcalabash.com/ns/extensions" 
  xmlns:docx2hub="http://transpect.io/docx2hub"
  xmlns:hub2htm="http://transpect.io/hub2htm"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:tr="http://transpect.io"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:dbk="http://docbook.org/ns/docbook"
  xmlns:html="http://www.w3.org/1999/xhtml"
  name="docx2html" type="docx2hub:html">
   
  <p:output port="result" primary="true">
    <p:pipe port="result" step="hub2htm-convert"></p:pipe>
  </p:output>
 <!-- <p:output port="insert-xpath">
    <p:pipe port="insert-xpath" step="docx2hub"></p:pipe>
  </p:output>-->
  <p:serialization port="result" omit-xml-declaration="false" method="xhtml"/>
  
  <p:option name="file" required="true">
    <p:documentation>The file to be mapped</p:documentation>
  </p:option>
  <p:option name="main-uri" required="false"></p:option>
  <p:option name="template" required="false"></p:option>
  <p:option name="debug" required="false" select="'no'"/>
  <p:option name="debug-dir-uri" select="'debug'"/>
  <p:option name="status-dir-uri" select="'status'"/>
  <p:option name="temp-dir-uri" required="false" select="'temp'"></p:option>
 
  <p:import href="http://transpect.io/hub2html/xpl/hub2html.xpl"/>
  <p:import href="http://xmlcalabash.com/extension/steps/library-1.0.xpl" />
  <p:import href="http://transpect.io/xproc-util/store-debug/xpl/store-debug.xpl"/>
  <p:import href="http://transpect.io/docx2hub/xpl/docx2hub.xpl"/>
  <p:import href="http://transpect.io/docx2hub/xpl/single-tree.xpl"/>
  <p:import href="http://transpect.io/cascade/xpl/paths.xpl"/>
  
  <tr:paths name="paths">
    <p:with-option name="pipeline" select="'docx2html'"/>
<!--    <p:with-option name="interface-language" select="$interface-language"/>-->
<!--    <p:with-option name="clades" select="$clades"/>-->
    <p:with-option name="file" select="$file"/>
    <p:with-option name="debug" select="$debug"/>
    <p:with-option name="debug-dir-uri" select="$debug-dir-uri"/>
    <p:with-option name="progress" select="'yes'"/><p:input port="stylesheet">
      <p:document href="http://transpect.io/cascade/xsl/paths.xsl"/>
    </p:input>
    <p:input port="conf">
      <!--<p:pipe port="conf" step="transpect-custom-paths"/>-->
      <p:document href="http://customers.le-tex.de/generic/book-conversion/conf/transpect-conf.xml"/>
    </p:input>
  </tr:paths>
  
  <docx2hub:convert name="docx2hub">
    <p:with-option name="debug" select="$debug"/>
    <p:with-option name="debug-dir-uri" select="$debug-dir-uri"/>
    <p:with-option name="docx" select="$file"/>
    <p:with-option name="srcpaths" select="'yes'"/>
    <p:with-option name="unwrap-tooltip-links" select="'yes'"/>
  </docx2hub:convert>
 
  <tr:store-debug pipeline-step="docx2html/hub_without_episode">
    <p:with-option name="active" select="$debug"/>
    <p:with-option name="base-uri" select="$debug-dir-uri"/>
  </tr:store-debug>
  <p:sink></p:sink>
  
  <p:identity>
    <p:input port="source">
      <p:pipe port="result" step="docx2hub"></p:pipe>
    </p:input>
  </p:identity>
  
  <p:insert name="add-episode-keyword" match="/*/dbk:info" position="last-child">
    <p:input port="insertion">
      <p:inline>
        <keywordset role="stylemapper" xmlns="http://docbook.org/ns/docbook">
          <keyword role="episode"><placeholder/></keyword>
        </keywordset>
      </p:inline>
    </p:input>
  </p:insert>

  <p:string-replace match="/*/dbk:info/dbk:keywordset[@role ='stylemapper']/dbk:keyword[@role='episode']/dbk:placeholder">
    <p:with-option name="replace" select="concat('''', p:system-property('p:episode'),'_docx','''')"></p:with-option>
  </p:string-replace>
  
  <p:xslt name="docx2hub_extended">
  <p:input port="stylesheet">
    <p:document href="http://transpect.io/stylemapper/xsl/docx2hub_extended.xsl"/>
  </p:input>
  <p:input port="parameters">
      <p:empty/>
    </p:input>
  </p:xslt>

  <tr:store-debug pipeline-step="docx2html/extended_deleted_phrases">
    <p:with-option name="active" select="$debug"/>
    <p:with-option name="base-uri" select="$debug-dir-uri"/>
  </tr:store-debug>
  <p:sink/>
  
  <p:xslt name="docx2hub_space_comp">
    <p:input port="source">
      <p:pipe port="result" step="docx2hub_extended"></p:pipe>
    </p:input>
      <p:input port="stylesheet">
        <p:document href="http://transpect.io/stylemapper/xsl/docx2hub_space_comp.xsl"/>
      </p:input>
      <p:input port="parameters">
        <p:empty/>
      </p:input>
  </p:xslt>
  
  <p:xslt name="add-attributes">
    <p:input port="source"></p:input>
    <p:input port="stylesheet">
      <p:document href="http://transpect.io/stylemapper/xsl/add-attributes.xsl"></p:document>
    </p:input>
    <p:input port="parameters">
      <p:empty/>
    </p:input>
  </p:xslt>

  <p:store name="save-hub">
    <p:with-option name="href" select="concat($main-uri, '/',p:system-property('p:episode'),'/',p:system-property('p:episode'), '_hub.xml')"/>
  </p:store>

  <hub2htm:convert name="hub2htm-convert">
    <p:input port="source">
      <p:pipe port="result" step="add-attributes"></p:pipe>
    </p:input>
    <p:input port="paths">
      <p:pipe port="result" step="paths"/>
    </p:input>
    <p:input port="other-params">
      <p:inline>
        <c:param-set>
          <c:param name="overwrite-image-paths" value="yes"/>
        </c:param-set>  
      </p:inline>
    </p:input>
    <p:with-param name="html-title" select="'temp'"/>
    <p:with-option name="debug" select="$debug"/>
    <p:with-option name="debug-dir-uri" select="$debug-dir-uri"/> 
    <p:with-option name="status-dir-uri" select="$status-dir-uri"/>
  </hub2htm:convert>

  <p:xslt name="p-block2inline">
    <p:input port="source"></p:input>
    <p:input port="stylesheet">
      <p:document href="http://transpect.io/stylemapper/xsl/block2inline.xsl"></p:document>
    </p:input>
    <p:input port="parameters">
      <p:empty></p:empty>
    </p:input>
  </p:xslt>
  
  <p:store name="save-xhtml">
    <p:with-option name="href" select="concat($temp-dir-uri,'/source-content.xhtml')"></p:with-option>
  </p:store>
  
  <p:identity>
    <p:input port="source">
      <p:pipe port="zip-manifest" step="docx2hub"></p:pipe>
    </p:input>
  </p:identity>
 
  <p:store name="save-zip-manifest">
    <p:with-option name="href" select="concat($main-uri, '/',p:system-property('p:episode'),'/',p:system-property('p:episode'), '_zip_manifest.xml')"/>
  </p:store>
 
  <p:identity>
    <p:input port="source">
      <p:pipe port="insert-xpath" step="docx2hub"></p:pipe>
    </p:input>
  </p:identity>
  
  <p:store name="save-singletree">
    <p:with-option name="href" select="concat($main-uri, '/',p:system-property('p:episode'),'/',p:system-property('p:episode'), '_single_tree.xml')"/>
  </p:store>

  <docx2hub:single-tree name="template-single-tree">
      <p:with-option name="docx" select="$template"/>
      <p:with-option name="debug" select="$debug"/>
      <p:with-option name="debug-dir-uri" select="$debug-dir-uri"/>
    </docx2hub:single-tree>

  <tr:store-debug pipeline-step="docx2html/template-singletree">
    <p:with-option name="active" select="$debug"/>
    <p:with-option name="base-uri" select="$debug-dir-uri"/>
  </tr:store-debug>
  
  <p:xslt name="extract-wstyles">
    <p:input port="stylesheet">
      <p:document href="http://transpect.io/stylemapper/xsl/extract-template-styles.xsl"></p:document>
    </p:input>
    <p:input port="parameters">
      <p:empty></p:empty>
    </p:input>    
  </p:xslt>
  <p:store>
    <p:with-option name="href" select="concat($temp-dir-uri,'/template_styles.xml')"></p:with-option>
  </p:store>
</p:declare-step>