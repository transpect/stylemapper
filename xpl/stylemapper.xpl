<?xml version="1.0" encoding="UTF-8"?>
<p:declare-step xmlns:p="http://www.w3.org/ns/xproc" 
  xmlns:c="http://www.w3.org/ns/xproc-step" version="1.0"
  xmlns:cx="http://xmlcalabash.com/ns/extensions"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:docx2hub="http://transpect.io/docx2hub"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:idml2xml="http://transpect.io/idml2xml"
  xmlns:tr="http://transpect.io" 
  xmlns:stylemapper="http://transpect.io/stylemapper"
  xmlns:hub2htm="http://transpect.io/hub2htm"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
  xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"
  name="stylemapper" type="stylemapper:process">
  
  <p:input port="source" primary="true">
    <p:empty/>
  </p:input>
  <p:input port="single-tree-doc">
    <p:empty/>
  </p:input>
  <p:input port="hub-doc">
    <p:empty/>
  </p:input>
  <p:input port="zip-manifest">
    <p:empty/>
  </p:input>

  <p:output port="result" primary="true"/>
  <p:option name="template" required="true">
    <p:documentation>The file where the target styles are taken from.</p:documentation>
  </p:option>
  <p:option name="debug" select="'yes'"/>
  <p:option name="debug-dir-uri" select="''"/>
  

  <p:serialization port="result" indent="true"/>

  <p:import href="http://xmlcalabash.com/extension/steps/library-1.0.xpl"/>
  <p:import href="http://transpect.io/xproc-util/store-debug/xpl/store-debug.xpl"/>
  <p:import href="http://transpect.io/docx2hub/xpl/docx2hub.xpl"/>
  <p:import href="http://transpect.io/docx2hub/xpl/single-tree.xpl"/>
  <p:import href="http://transpect.le-tex.de/stylemapper/xpl/idml2html.xpl"/>
  <p:import href="http://transpect.io/idml2xml/xpl/idml_single-doc.xpl"/>
  
  <p:xslt name="mapping2xsl">
    <p:input port="source"/>
    <p:input port="stylesheet">
      <p:document href="http://transpect.le-tex.de/stylemapper/xsl/mapping2xsl.xsl"/>
    </p:input>
    <p:input port="parameters">
      <p:empty/>
    </p:input>
  </p:xslt>

  <tr:store-debug pipeline-step="mapping/generated-1-mapping2xsl-result" extension="xsl">
    <p:with-option name="active" select="$debug"/>
    <p:with-option name="base-uri" select="$debug-dir-uri"/>
  </tr:store-debug>
  <p:sink/>

  <p:xslt name="make-format-explicit">
    <p:input port="source">
      <p:pipe port="hub-doc" step="stylemapper"></p:pipe>
    </p:input>
    <p:input port="stylesheet">
      <p:pipe port="result" step="mapping2xsl"/>
    </p:input>
    <p:input port="parameters">
      <p:empty/>
    </p:input>
  </p:xslt>
  
  <tr:store-debug pipeline-step="mapping/make-format-explicit-debug">
    <p:with-option name="active" select="$debug"/>
    <p:with-option name="base-uri" select="$debug-dir-uri"/>
  </tr:store-debug>

  <p:xslt name="mark-para">
    <p:input port="stylesheet">
      <p:document href="http://transpect.le-tex.de/stylemapper/xsl/mark_para.xsl"/>
    </p:input>
    <p:input port="parameters">
      <p:empty/>
    </p:input>
  </p:xslt>

  <tr:store-debug pipeline-step="mapping/extended-2-add-role-to-para">
    <p:with-option name="active" select="$debug"/>
    <p:with-option name="base-uri" select="$debug-dir-uri"/>
  </tr:store-debug>
  <p:sink/>
  
  <p:xslt name="insert-style">
    <p:input port="source">
      <p:pipe port="single-tree-doc" step="stylemapper"/>
      <p:pipe port="result" step="mark-para"/>
    </p:input>
    <p:input port="stylesheet">
      <p:document href="http://transpect.le-tex.de/stylemapper/xsl/insert-style2insert-xpath.xsl"/>
    </p:input>
    <p:input port="parameters">
      <p:empty/>
    </p:input>
  </p:xslt>

  <tr:store-debug pipeline-step="mapping/insert-styles">
    <p:with-option name="active" select="$debug"/>
    <p:with-option name="base-uri" select="$debug-dir-uri"/>
  </tr:store-debug>
  
  <p:group>
    <p:variable name="file-base-uri" select="base-uri(*)">
      <p:pipe port="single-tree-doc" step="stylemapper"/>
    </p:variable>
  <cx:message>
    <p:with-option name="message" select="'OHOHOHOHOHO', $file-base-uri"></p:with-option>
    <p:with-option name="log" select="'info'"></p:with-option>
  </cx:message>
    
    <p:choose>
      <p:when test="ends-with($template, '.docx') or ends-with($template, '.dotm')">
        <docx2hub:single-tree name="template-single-tree">
          <p:with-option name="docx" select="$template"/>
          <p:with-option name="debug" select="$debug"/>
          <p:with-option name="debug-dir-uri" select="$debug-dir-uri"/>
        </docx2hub:single-tree>
        
        <p:viewport match="/w:root/*[@xml:base]" name="add-file-base">
          <p:add-attribute attribute-name="xml:base" match="/*[@xml:base]">
            <p:with-option name="attribute-value" select="concat($file-base-uri, replace(/*/@xml:base, '^.+\.tmp/', ''))"/>
          </p:add-attribute>
        </p:viewport>
        
       <!-- <cx:message>
          <p:with-option name="message" select="'zzzzzzzzzzzzzzzzzzz', concat($file-base-uri, replace(/*/@xml:base, '^.+\.tmp/', ''))"></p:with-option>
          <p:with-option name="log" select="'info'"></p:with-option>
        </cx:message>-->
 
        <p:replace match="/w:root/w:styles" name="replace-styles">
          <p:input port="source">
            <p:pipe port="result" step="insert-style"/>
          </p:input>
          <p:input port="replacement" select="/w:root/w:styles">
            <p:pipe port="result" step="add-file-base"/>
          </p:input>
        </p:replace>

        <tr:store-debug pipeline-step="mapping/transplant-ffff">
          <p:with-option name="active" select="$debug"/>
          <p:with-option name="base-uri" select="$debug-dir-uri"/>
        </tr:store-debug>
      </p:when>
      <p:when test="ends-with($template, '.idml')">
        <idml2xml:single-doc name="template-single-tree">
          <p:input port="xslt-stylesheet">
            <p:document href="../../idml2xml/xsl/idml2xml.xsl"/>
          </p:input>
          <p:with-option name="idmlfile" select="$template"/>
          <p:with-option name="srcpaths" select="'yes'"/>  
          <p:with-option name="all-styles" select="'yes'"/>   
          <p:with-option name="debug" select="$debug"/>
          <p:with-option name="debug-dir-uri" select="$debug-dir-uri"/>
        </idml2xml:single-doc>
        
        <tr:store-debug pipeline-step="mapping/single-tree-doc">
          <p:with-option name="active" select="$debug"/>
          <p:with-option name="base-uri" select="$debug-dir-uri"/>
        </tr:store-debug>
        
        <p:viewport match="/Document/*[@xml:base]" name="add-file-base">
          <p:add-attribute attribute-name="xml:base" match="/*[@xml:base]">
            <p:with-option name="attribute-value" select="concat($file-base-uri, replace(/*/@xml:base, '^.+\.tmp/', '' ))"/>
          </p:add-attribute>
        </p:viewport>

        <p:replace match="/Document/idPkg:Styles" name="replace-styles">
          <p:input port="source">
            <p:pipe port="result" step="insert-style"/>
          </p:input>
          <p:input port="replacement" select="/Document/idPkg:Styles">
            <p:pipe port="result" step="add-file-base"/>
          </p:input>
        </p:replace>
        
        <tr:store-debug pipeline-step="mapping/transplant">
          <p:with-option name="active" select="$debug"/>
          <p:with-option name="base-uri" select="$debug-dir-uri"/>
        </tr:store-debug>
        
      </p:when>
    </p:choose>

    <p:xslt name="delete-scrpath">
      <p:input port="stylesheet">
        <p:document href="../xsl/delete-srcpath.xsl"/>
      </p:input>
      <p:input port="parameters">
        <p:empty/>
      </p:input>
    </p:xslt>

    <tr:store-debug pipeline-step="mapping/transplant-styles-4">
      <p:with-option name="active" select="$debug"/>
      <p:with-option name="base-uri" select="$debug-dir-uri"/>
    </tr:store-debug>

    <p:viewport match="/Document/*[local-name() = ('Styles', 'Story')]|/w:root/*[local-name() = ('styles', 'document')]" name="store-modified">
      <p:output port="result" primary="true">
        <p:empty/>
      </p:output>
      <p:add-attribute match="/*[@mc:Ignorable]" attribute-name="mc:Ignorable">
        <p:with-option name="attribute-value" 
          select="string-join(
                    for $root in /* 
                    return (tokenize(/*/@mc:Ignorable, '\s+')
                             [. = distinct-values(for $n in $root/descendant-or-self::* return in-scope-prefixes($n))]),
                    ' '
                  )"/>
      </p:add-attribute>
      <p:store>
        <p:with-option name="href" select="/*/@xml:base"/>
      </p:store>
    </p:viewport>

    <cx:zip compression-method="deflated" compression-level="default" command="create" name="zip" cx:depends-on="store-modified">
      <p:with-option name="href" select="replace($file-base-uri, '(docx|idml)\.tmp/?.+', 'mod.$1')"/>
      <p:input port="source">
        <p:empty/>
      </p:input>
      <p:input port="manifest">
        <p:pipe port="zip-manifest" step="stylemapper"/>
      </p:input>
    </cx:zip>


  </p:group>
</p:declare-step>
