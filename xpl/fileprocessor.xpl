<?xml version="1.0" encoding="UTF-8"?>
<p:declare-step xmlns:p="http://www.w3.org/ns/xproc"
  xmlns:c="http://www.w3.org/ns/xproc-step" version="1.0"
  xmlns:html="http://www.w3.org/1999/xhtml"
  xmlns:cx="http://xmlcalabash.com/ns/extensions"
  xmlns:docx2hub="http://transpect.io/docx2hub"
  xmlns:idml2xml="http://transpect.io/idml2xml"
  xmlns:tr="http://transpect.io"
  xmlns:stylemapper="http://transpect.io/stylemapper" name="fileprocessor">
  <p:input port="source" primary="true">
    <p:inline>
      <html xmlns="http://www.w3.org/1999/xhtml"/>
    </p:inline>
    <p:documentation>optional XHTML file with /html/head/meta[@name = 'episode']</p:documentation>
  </p:input>
  <p:option name="file" required="true">
        <p:documentation>The file to be mapped(docx) or mapping rules(xml)</p:documentation>
  </p:option>
  <p:option name="main-uri" required="false"></p:option>
  <p:option name="debug" required="false"></p:option>
  <p:option name="template" required="false" select="''"/>
  <p:option name="debug-dir-uri" select="'debug'"/>
  <p:option name="status-dir-uri" select="'debug/status'"/>
  <p:option name="temp-dir-uri" required="false" select="'temp'"/>
  <p:output port="result"/>
  
  <p:import href="http://transpect.le-tex.de/stylemapper/xpl/stylemapper.xpl"/>
  <p:import href="http://transpect.le-tex.de/stylemapper/xpl/docx2html.xpl"/>
  <p:import href="http://transpect.le-tex.de/stylemapper/xpl/idml2html.xpl"/>
  <p:import href="http://transpect.io/xproc-util/file-uri/xpl/file-uri.xpl"/>
  <p:import href="http://xmlcalabash.com/extension/steps/library-1.0.xpl"/>
  <p:import href="http://transpect.io/xproc-util/store-debug/xpl/store-debug.xpl"/>
    
  <p:choose name="distinction">
    <p:when test="ends-with($file, '.docx')">
      <docx2hub:html>
        <p:with-option name="debug" select="$debug"/>
        <p:with-option name="debug-dir-uri" select="$debug-dir-uri"/>
        <p:with-option name="status-dir-uri" select="$status-dir-uri"/>
        <p:with-option name="file" select="$file"/>
        <p:with-option name="template" select="$template"/>
        <p:with-option name="temp-dir-uri" select="$temp-dir-uri"/>
        <p:with-option name="main-uri" select="$main-uri"/>
      </docx2hub:html>
    </p:when>
    <p:when test="ends-with($file, '.idml')">
      <idml2xml:html>
        <p:with-option name="debug" select="$debug"/>
        <p:with-option name="debug-dir-uri" select="$debug-dir-uri"/>
        <p:with-option name="status-dir-uri" select="$status-dir-uri"/>
        <p:with-option name="file" select="$file"/>
        <p:with-option name="template" select="$template"/>
        <p:with-option name="temp-dir-uri" select="$temp-dir-uri"/>
        <p:with-option name="main-uri" select="$main-uri"/>
      </idml2xml:html>
    </p:when>      
    <p:when test="ends-with($file, '.xml')">
      <p:variable name="episode"
        select="replace(
                            tokenize($file, '/')[last()]
                            , '(_docx|_idml)\.xml', '')"
        >
      </p:variable>
        <cx:message>
          <p:with-option name="message" select="'AHHAHAHAHAHHA', $episode"></p:with-option>
          <p:with-option name="log" select="'info'"></p:with-option>
        </cx:message>
      <tr:file-uri name="zip-manifest-uri">
        <p:with-option name="filename" select="concat($main-uri,'/',$episode,'/', $episode, '_zip_manifest.xml')"></p:with-option>
      </tr:file-uri>
      
      <tr:store-debug pipeline-step="debug/zip-manifest">
        <p:with-option name="active" select="$debug"/>
        <p:with-option name="base-uri" select="$debug-dir-uri"/>
      </tr:store-debug>

      <p:load name="load-zip-manifest">
        <p:with-option name="href" select="/*/@local-href"></p:with-option>
      </p:load>
      <p:sink/>

      <p:load name="load-single-tree">
        <p:with-option name="href" select="concat($main-uri,'/',$episode,'/', $episode, '_single_tree.xml')"></p:with-option>
      </p:load>
      
      <tr:store-debug pipeline-step="debug/debug-single-tree">
        <p:with-option name="active" select="$debug"></p:with-option>
        <p:with-option name="base-uri" select="$debug-dir-uri"/>
      </tr:store-debug>
      <p:sink/>

      <tr:file-uri name="hub-uri">
        <p:with-option name="filename" select="concat($main-uri,'/',$episode,'/', $episode, '_hub.xml')"></p:with-option>
      </tr:file-uri>
      
      <p:load name="load-hub">
        <p:with-option name="href" select="/*/@local-href"/>
      </p:load>

      <tr:store-debug pipeline-step="debug/debug-hub">
        <p:with-option name="active" select="$debug"></p:with-option>
        <p:with-option name="base-uri" select="$debug-dir-uri"/>
      </tr:store-debug>
      <p:sink/>
      
      <tr:file-uri name="xml-uri">
        <p:with-option name="filename" select="$file"></p:with-option>
      </tr:file-uri>
      
      <p:load name="load-xml">
        <p:with-option name="href" select="/*/@local-href"/>
      </p:load>
       
      <tr:store-debug pipeline-step="debug/debug-mapping.xml">
        <p:with-option name="active" select="$debug"></p:with-option>
        <p:with-option name="base-uri" select="$debug-dir-uri"/>
      </tr:store-debug>
      <p:sink/>
      
        <stylemapper:process>
          <p:input port="source">
            <p:pipe port="result" step="load-xml"></p:pipe>
          </p:input>
          <p:input port="zip-manifest">
            <p:pipe port="result" step="load-zip-manifest"></p:pipe>
          </p:input>
          <p:input port="single-tree-doc">
            <p:pipe port="result" step="load-single-tree"></p:pipe>
          </p:input>
          <p:input port="hub-doc">
            <p:pipe port="result" step="load-hub"></p:pipe>
          </p:input>
          <p:with-option name="template" select="$template"/>
          <p:with-option name="debug" select="$debug"/>
          <p:with-option name="debug-dir-uri" select="$debug-dir-uri"/>
        </stylemapper:process>
    </p:when>
    <p:otherwise>
      <p:error code="wrong-format">
        <p:input port="source">
          <p:inline>
            <message>Wrong document format. Only docx and xml documents are allowed.</message>
          </p:inline>
        </p:input>
      </p:error>
    </p:otherwise>
  </p:choose> 
</p:declare-step>