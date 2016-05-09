<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:rel="http://schemas.openxmlformats.org/package/2006/relationships"
    xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
    xmlns:sm="http://transpect.io/stylemapper" 
    xmlns:css="http://www.w3.org/1996/css"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:html="http://www.w3.org/1999/xhtml"
    xmlns:dbk="http://docbook.org/ns/docbook" 
    xmlns:xs="http://www.w3.org/2001/XMLSchema" 
    exclude-result-prefixes="#all"
    version="2.0">
    
    <xsl:template match="*|@*">
        <xsl:copy>
            <xsl:apply-templates select="node()|@*"></xsl:apply-templates>
        </xsl:copy>
    </xsl:template>
    
  <xsl:template match="html:span/@style">
    <xsl:variable name="var">
      <xsl:value-of select="."></xsl:value-of>
    </xsl:variable>
    <xsl:choose>
      <xsl:when test="contains(., '(display:.?)(block|inherit)')">
        <xsl:attribute name="style">
          <xsl:value-of select="replace(., '(display:.?)(block|inherit)', 'display: inline')"></xsl:value-of>
        </xsl:attribute>
      </xsl:when>
      <xsl:otherwise>
        <xsl:attribute name="style">
          <xsl:value-of select="concat(., '; display: inline')"></xsl:value-of>
        </xsl:attribute>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  
  <xsl:template match="html:p[@srcpath]">
    <xsl:copy>
      <xsl:apply-templates select="@*"/>
      <xsl:attribute name="data-view-priority"/>
      <xsl:element name="span">
        <xsl:attribute name="class" select="'prev pa'"/> ¶ 
      </xsl:element>
      <xsl:apply-templates select="node()"/>
    </xsl:copy>
  </xsl:template>
  
  <xsl:template match="html:span[@srcpath]">
    <xsl:copy>
    <xsl:attribute name="data-view-priority"/>
    <xsl:apply-templates select="@*"/>  
    <xsl:element name="span">
      <xsl:attribute name="class" select="'prev in'"/>
      T
    </xsl:element>
    <xsl:apply-templates select="node()"/>
    </xsl:copy>
  </xsl:template>
  
  
    
</xsl:stylesheet>