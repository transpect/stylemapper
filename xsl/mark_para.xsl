<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:tr="http://transpect.io"
  xmlns:sm="http://www.le-tex.de/namespace/stylemapper"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:dbk="http://docbook.org/ns/docbook"
  xmlns:css="http://www.w3.org/1996/css"
  xmlns:adhcss="http://transpect.io/adhcss"
  xpath-default-namespace="http://docbook.org/ns/docbook"
  exclude-result-prefixes="xs"
  version="2.0">
  
  <xsl:template match="@*|*">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>
  
  <xsl:function name="tr:contains-token" as="xs:boolean">
    <xsl:param name="tokens" as="xs:string?"/>
    <xsl:param name="token" as="xs:string?"/>
    <xsl:sequence select="tokenize($tokens, '\s+') = $token"/>
  </xsl:function>
  
  <xsl:template match="para[not(normalize-space())]
                           [
                              following-sibling::*[normalize-space()][1]
                              /self::para[tr:contains-token(@mapping-rules, 'margin-top')]
                           ]">
    <xsl:copy>
      <xsl:attribute name="sm:action" select="'delete'"/>
      <xsl:apply-templates select="@*,node()" mode="#current"/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="*[local-name() = ('phrase', 'subscript', 'superscript')]
                        [@srcpath]">
    <xsl:copy>
      <xsl:call-template name="merge-remove-adhocs">
        <xsl:with-param name="from-para" select="ancestor::para[1]/@sm:remove-adhoc" as="attribute(sm:remove-adhoc)?"/>
        <xsl:with-param name="from-phrase" select="@sm:remove-adhoc" as="attribute(sm:remove-adhoc)?"/>
      </xsl:call-template>
      <xsl:apply-templates select="@* except @sm:remove-adhoc, node()" mode="#current"/>      
    </xsl:copy>
  </xsl:template>
  
  <xsl:template name="merge-remove-adhocs" as="attribute(sm:remove-adhoc)?">
    <xsl:param name="from-para" as="attribute(sm:remove-adhoc)?"/>
    <xsl:param name="from-phrase" as="attribute(sm:remove-adhoc)?"/>
    <xsl:variable name="tmp" as="xs:string*" 
      select="distinct-values(
                 (
                    tokenize($from-para, '\s+'),
                    tokenize($from-phrase, '\s+')
                 )
              )"/>
    <xsl:if test="exists($tmp)">
      <xsl:attribute name="sm:remove-adhoc" separator=" "
        select="if ($tmp = '#all')
                then '#all'
                else $tmp"/>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>
  