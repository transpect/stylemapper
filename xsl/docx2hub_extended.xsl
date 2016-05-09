<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:css="http://www.w3.org/1996/css"
  xmlns:dbk="http://docbook.org/ns/docbook"
  xmlns:adhcss="http://transpect.io/adhcss"
  exclude-result-prefixes="#all"
  xpath-default-namespace="http://docbook.org/ns/docbook"
  version="2.0">
  <!-- lookup-key nach @name aus css:rule -->
  <xsl:key name="rule-by-role" match="css:rule" use="@name"/>
  
  <xsl:template match="*|@*">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>
  <!-- template, welches auf sämtliche paras matched, @role-attributwerte gleich den @name-attributwerten entspricht--> 
  <xsl:template match="*[@role]" priority="3">
    <xsl:copy>
      <xsl:copy-of select="key('rule-by-role', @role)/(@css:*|@xml:lang)"/>
      <xsl:apply-templates select="@css:*" mode="adhoc_css"/>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates select="node()"></xsl:apply-templates>
    </xsl:copy>
  </xsl:template>
  
  <xsl:template match="*[not(@role)]" priority="3">
    <xsl:copy>
      <xsl:apply-templates select="@css:*" mode="adhoc_css"/>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates select="node()"></xsl:apply-templates>
    </xsl:copy>
  </xsl:template>
  <!-- template matched nur, wenn genau eine kindelement im absatzelement ist  -->
  <xsl:template match="phrase[count(../node()) = 1]|subscript[count(../node()) = 1]|superscript[count(../node()) = 1]" priority="2">
    <xsl:copy-of select="key('rule-by-role', @role)/(@css:*|@xml:lang)"/>
    <xsl:apply-templates select="@css:*" mode="adhoc_css"/>
    <xsl:copy-of select="@css:* | @xml:lang"/>
    <xsl:copy-of select="text()"/>
  </xsl:template>
  
  <xsl:template match="@css:*" as="attribute(*)" priority="2" mode="css">
    <xsl:copy-of select="."/>
  </xsl:template>
  
  <xsl:template match="@css:*" mode="adhoc_css">
    <xsl:attribute name="{concat('adhcss:', local-name())}">
      <xsl:value-of select="."></xsl:value-of>
    </xsl:attribute>
  </xsl:template>
  
</xsl:stylesheet>