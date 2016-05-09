<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"
  exclude-result-prefixes="xs"
  version="2.0">
  
  <xsl:template match="*|@*">
    <xsl:copy>
      <xsl:apply-templates select="node()|@*"></xsl:apply-templates>
    </xsl:copy>
  </xsl:template>
  
  <xsl:template match="@*[not(local-name() = ('styleId', 'type', 'Name'))]| *" priority="2"/>
  
  <xsl:template match="w:style|ParagraphStyle|CharacterStyle|w:styles|idPkg:Styles" priority="3">
    <xsl:choose>
      <xsl:when test="not(.[@Name = ('$ID/[No character style]', '$ID/[No paragraph style]')])">
        <xsl:copy>
          <xsl:if test="not(local-name() = ('Styles', 'styles'))">
          <xsl:attribute name="target-type" select="if (./@w:type eq 'paragraph' or local-name() eq 'ParagraphStyle') 
                                                      then 'para' 
                                                    else 'inline' "></xsl:attribute>
          </xsl:if>
          <xsl:apply-templates select="node()|@*"/>
        </xsl:copy>  
      </xsl:when>
      <xsl:otherwise>
        <xsl:next-match></xsl:next-match>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  
  <xsl:template match="RootParagraphStyleGroup | RootCharacterStyleGroup" priority="3">
    <xsl:apply-templates select="ParagraphStyle| CharacterStyle"/>
  </xsl:template>
  
  <xsl:template match="w:root | Document" priority="3">
    <xsl:apply-templates select="node()"></xsl:apply-templates>
  </xsl:template>
  
</xsl:stylesheet>
