<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet version="2.0" 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema" 
  xmlns:saxon="http://saxon.sf.net/"
  xmlns:idml2xml="http://transpect.io/idml2xml" 
  xmlns:html="http://www.w3.org/1999/xhtml"
  xmlns:epub="http://www.idpf.org/2007/ops"
  xmlns:css="http://www.w3.org/1996/css" 
  xmlns:adhcss="http://transpect.io/adhcss"
  xmlns:xlink="http://www.w3.org/1999/xlink" 
  xmlns:dbk="http://docbook.org/ns/docbook"
  xmlns:c="http://www.w3.org/ns/xproc-step"
  xmlns:hub2htm="http://transpect.io//hub2htm" 
  xmlns:docx2hub="http://transpect.io/docx2hub"
  xmlns:mml="http://www.w3.org/1998/Math/MathML"
  xmlns="http://www.w3.org/1999/xhtml" exclude-result-prefixes="#all">
  
  <xsl:import href="http://transpect.io/hub2html/xsl/hub2html.xsl"/>

<!--  important function change to have a style attribute instead of an element (e.g. span style="italic"> instead of <i>) -->
  <xsl:function name="css:map-att-to-elt" as="xs:string?">
    <xsl:param name="prop" as="attribute(*)"/>
    <xsl:param name="context" as="element(*)"/>
  </xsl:function>
 
  <xsl:key name="role2atts" match="css:rule[@name]" use="@name"></xsl:key>
  <xsl:variable name="att-regex" as="xs:string" select="'^(css:|(background-)?color-)'"/>
  
  <xsl:template match="*" mode="class-att">
    <xsl:if test="@role">
      <xsl:variable name="overrides" as="attribute(*)*" select="@adhcss:*"/>
        <xsl:variable name="atts" as="xs:string*">
          <xsl:apply-templates select="key('role2atts', @role)/@*[matches(name(), $att-regex)][not(local-name() = $overrides/local-name())], 
            @*[matches(local-name(), $att-regex)], $overrides" mode="css-classes"/>
        </xsl:variable>
      <xsl:attribute name="class">
        <xsl:sequence select="string-join((@role, $atts), ' ')"/>
      </xsl:attribute>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="@*[matches(name(), $att-regex)]" mode="hub2htm-default"/>

  <xsl:template match="@*" mode="css-classes"/>
  
  <xsl:template match="@css:font-size | @adhcss:font-size" mode="css-classes" priority="2">
    <xsl:variable name="val">
      <xsl:value-of select="."></xsl:value-of>
    </xsl:variable>
    <xsl:sequence select="concat( 'fs_', replace(replace($val, 'pt$', ''), '\.', '_'))"></xsl:sequence>
    <xsl:next-match></xsl:next-match>
  </xsl:template>
  
  <xsl:template match="@css:font-style | @adhcss:font-style" mode="css-classes" priority="2">
    <xsl:variable name="val">
      <xsl:value-of select="."></xsl:value-of>
    </xsl:variable>
    <xsl:sequence select="concat( 'fst_', $val)"></xsl:sequence>
  </xsl:template>
  
  <xsl:template match="@css:font-weight | @adhcss:font-weight" mode="css-classes" priority="2">
    <xsl:variable name="val">
      <xsl:value-of select="."></xsl:value-of>
    </xsl:variable>
    <xsl:sequence select="concat( 'fw_', $val)"></xsl:sequence>
  </xsl:template>
  
  <xsl:template match="@css:font-family | @adhcss:font-family" mode="css-classes" priority="2">
    <xsl:variable name="val">
      <xsl:value-of select="."></xsl:value-of>
    </xsl:variable>
    <xsl:sequence select="concat( 'fm_', replace($val, '\s', ''))"></xsl:sequence>
  </xsl:template>

  <xsl:template match="@color-h | @color-s | @color-l" mode="css-classes" priority="2">
    <xsl:variable name="val" as="xs:string">
      <xsl:value-of select="."></xsl:value-of>
    </xsl:variable>
    <xsl:sequence select="concat('c_',replace(name(.), '^.{5}-', ''),'_', $val)"></xsl:sequence>
    <xsl:next-match></xsl:next-match>
  </xsl:template>
  
  <xsl:template match="@background-color-h | @background-color-s | @background-color-l" mode="css-classes" priority="2">
    <xsl:variable name="val">
      <xsl:value-of select="."></xsl:value-of>
    </xsl:variable>
    <xsl:sequence select="concat('bg_',replace(name(.), '^.{15}-', ''), '_', $val)"></xsl:sequence>
  </xsl:template>

  <!-- Handling ranged classes-->

  <xsl:template match="@css:font-size" mode="css-classes" priority="1.5">
    <xsl:variable name="val" as="xs:string">
      <xsl:value-of select="."></xsl:value-of>
    </xsl:variable>
    <xsl:variable name="rounded">
      <xsl:value-of select="
        floor(
        number(
        replace( $val, 'pt$', '')
        ))"></xsl:value-of>
    </xsl:variable>
    <xsl:sequence select="concat( 'r_fs_', replace($rounded, '\.', '_'))">
    </xsl:sequence>
  </xsl:template>

  <xsl:template match="@color-h | @color-s | @color-l" mode="css-classes" priority="1.5">
   <xsl:variable name="val" as="xs:integer">
    <xsl:value-of select="."></xsl:value-of>
   </xsl:variable>
    <xsl:sequence select="concat('r_c_',replace(name(.), '^.{5}-', ''),'_', floor($val div 10) * 10)"></xsl:sequence>
  </xsl:template>
    
 </xsl:stylesheet>
